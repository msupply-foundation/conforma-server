import databaseConnect from '../databaseConnect'
import { getUserInfo } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'
import { UserOrg } from '../../types'
import path from 'path'
import { readFileSync } from 'fs'
import { startCase } from 'lodash'
import { getAppEntryPointDir } from '../utilityFunctions'

const saltRounds = 10 // For bcrypt salting: 2^saltRounds = 1024

const routeCreateHash = async (request: any, reply: any) => {
  const { password } = request.body

  // bcrypt hash output includes salt and other metadata in string
  // See https://github.com/kelektiv/node.bcrypt.js#hash-info
  const hash = await bcrypt.hash(password, saltRounds)
  return reply.send({
    hash,
  })
}

/*
Authenticates login and returns:
  - userInfo
  - list of organisations belonging to user
  - template permissions
  - JWT containing permissions and userId
*/
const routeLogin = async (request: any, reply: any) => {
  try {
    const { username, password, sessionId } = request.body
    if (password === undefined) return reply.send({ success: false })

    const userOrgInfo: UserOrg[] = (await databaseConnect.getUserOrgData({ username })) || {}
    if (userOrgInfo.length === 0) return reply.send({ success: false })
    const { userId, passwordHash } = userOrgInfo?.[0]
    if (!userId) return reply.send({ success: false })

    if (!(await bcrypt.compare(password, passwordHash as string)))
      return reply.send({ success: false })

    // Login successful
    reply.send({
      success: true,
      ...(await getUserInfo({ userId, sessionId })),
    })
  } catch (err) {
    return reply.send({ success: false, error: err.message })
  }
}

/*
Authenticates user and checks they belong to requested org (id). Returns:
  - userInfo (including orgId and orgName)
  - template permissions
  - JWT (with orgId included)
*/
const routeLoginOrg = async (request: any, reply: any) => {
  const { auth, body } = request
  if (!body)
    return reply.send({
      success: false,
      message: 'Missing orgId in body.',
    })
  if (!body.orgId) return reply.send({ success: false, message: 'orgId not provided' })
  // if (!body.sessionId) return reply.send({ success: false, message: 'sessionId not provided' })
  const { orgId, sessionId } = body

  console.log('orgId', orgId, 'sessionId', sessionId, 'auth', auth)

  if (!auth.userId) return reply.send({ success: false, message: 'userId not provided' })
  const { userId, error } = request.auth
  if (error) return reply.send({ success: false, message: error })

  const userInfo = await getUserInfo({ userId, orgId, sessionId })

  reply.send({ success: true, ...userInfo })
}

/*
Authenticates user using JWT header and returns latest user/org info,
template permissions and new JWT token
*/
const routeUserInfo = async (request: any, reply: any) => {
  const { sessionId } = request.query
  const { userId, orgId, sessionId: returnSessionId, error } = request.auth
  if (error) return reply.send({ success: false, message: error })

  return reply.send({
    success: true,
    ...(await getUserInfo({ userId, orgId, sessionId: sessionId ?? returnSessionId })),
  })
}

const routeUserPermissions = async (request: any, reply: any) => {
  const { auth, query } = request
  if (!query || !query.username)
    return reply.send({
      success: false,
      message: 'Missing username in query.',
    })

  const { orgId, username } = query ?? { orgId: null }

  if (auth.error) return reply.send({ success: false, message: auth.console.error })

  const userExistingPermissions = await databaseConnect.getUserTemplatePermissions(username, orgId)
  console.log('userExistingPermissions', userExistingPermissions)

  const grantedPermissions = userExistingPermissions.map(({ permissionName }) => permissionName)

  const isSystemOrg = await databaseConnect.isInternalOrg(Number(orgId))

  const templatePermissionRows = await databaseConnect.getDistinctPermissions(isSystemOrg)

  return reply.send({
    templatePermissions: templatePermissionRows.map(({ name, description }) => ({
      name,
      description,
      display_name: startCase(name),
      is_user_granted: grantedPermissions.includes(name),
    })),
    grantedPermissions,
    availablePermissions: templatePermissionRows
      .filter((permission) => !grantedPermissions.includes(permission.name))
      .map(({ name }) => name),
  })
}

const routeUpdateRowPolicies = async (request: any, reply: any) => {
  // TODO, add parameters to only drop specific policies, for now drop and reinstante them all

  return reply.send(await updateRowPolicies())
}

const routeVerification = async (request: any, reply: any) => {
  const { uid } = request.query
  if (!uid) return reply.send({ success: false, message: 'No verification id provided' })
  try {
    // Get verification record
    const verification = await databaseConnect.getVerification(uid)
    if (!verification) return reply.send({ success: false, message: 'Invalid verification id' })

    // Check already verified
    if (verification.is_verified) return reply.send({ success: false, message: 'Already verified' })

    // Check expiry
    if (verification.time_expired && Date.parse(verification.time_expired) < Date.now())
      return reply.send({ success: false, message: 'Verification expired' })

    // All good! - Update verification record
    const result = await databaseConnect.setVerification(uid)
    if (result) return reply.send({ success: true, message: verification.message })
    else reply.send({ success: false, message: 'Problem with verification' })
  } catch (err) {
    return reply.send({ success: false, message: err.message })
  }
}

// Serve prefs to front-end
const routeGetPrefs = async (request: any, reply: any) => {
  const prefs = JSON.parse(
    readFileSync(path.join(getAppEntryPointDir(), '../preferences.json'), 'utf8')
  )
  const languageOptions = JSON.parse(
    readFileSync(path.join(getAppEntryPointDir(), '../localisation/languages.json'), 'utf8')
  )
  reply.send({ preferences: prefs.web, languageOptions })
}

// Unique name/email/organisation/other check
const routecheckUnique = async (request: any, reply: any) => {
  const { type, value, table, field } = request.query
  if (value === '' || value === undefined) {
    reply.send({
      unique: false,
      message: 'Value not provided',
    })
    return
  }
  let tableName, fieldName
  switch (type) {
    case 'username':
      tableName = 'user'
      fieldName = 'username'
      break
    case 'email':
      tableName = 'user'
      fieldName = 'email'
      break
    case 'organisation':
      tableName = 'organisation'
      fieldName = 'name'
      break
    default:
      if (!table || !field) {
        reply.send({
          unique: false,
          message: 'Type, table, or field missing or invalid',
        })
        return
      } else {
        tableName = table
        fieldName = field
      }
  }
  try {
    const isUnique = await databaseConnect.isUnique(tableName, fieldName, value)
    reply.send({
      unique: isUnique,
      message: '',
    })
  } catch (err) {
    reply.send({ unique: false, message: err.message })
  }
}

export {
  routeUserInfo,
  routeUserPermissions,
  routeLogin,
  routeLoginOrg,
  routeUpdateRowPolicies,
  routeCreateHash,
  routeVerification,
  routeGetPrefs,
  routecheckUnique,
}
