import databaseConnect from '../databaseConnect'
import { getUserInfo, getTokenData, extractJWTfromHeader } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'
import { UserOrg } from '../../types'
import prefs from '../../../preferences.json'
import languageOptions from '../../../localisation/languages.json'

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
  const { orgId, sessionId } = request.body
  const token = extractJWTfromHeader(request)
  const { userId, error } = await getTokenData(token)
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
  const token = extractJWTfromHeader(request)
  const { userId, orgId, sessionId: returnSessionId, error } = await getTokenData(token)
  if (error) return reply.send({ success: false, message: error })

  return reply.send({
    success: true,
    ...(await getUserInfo({ userId, orgId, sessionId: sessionId ?? returnSessionId })),
  })
}

const routeUpdateRowPolicies = async (request: any, reply: any) => {
  // const token = extractJWTfromHeader(request)
  // const username = await getUsername(token)
  // return reply.send(await getUserInfo(username))

  // TO DO, check for admin

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
  reply.send({ preferences: prefs.web, languageOptions })
}

export {
  routeUserInfo,
  routeLogin,
  routeLoginOrg,
  routeUpdateRowPolicies,
  routeCreateHash,
  routeVerification,
  routeGetPrefs,
}
