import databaseConnect from '../database/databaseConnect'
import { getUserInfo } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import {
  createSession,
  endSessions,
  hashRefreshToken,
  renewSession,
  setSessionOrg,
} from './userSessions'
import { asTime, authLog, quoted, sessionRef } from './authLog'
import {
  clearAuthCookies,
  getRefreshToken,
  setAccessCookie,
  setRefreshCookie,
} from './sessionCookies'
import bcrypt from 'bcrypt'
import { UserOrg } from '../../types'
import { PermissionDetails } from '../permissions/types'
import { startCase } from 'lodash'
import { errorMessage } from '../utilityFunctions'

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
    if (password === undefined) {
      authLog(`Login rejected for ${quoted(username)}: no password supplied`)
      return reply.send({ success: false })
    }

    const userOrgInfo: UserOrg[] = (await databaseConnect.getUserOrgData({ username })) || {}
    if (userOrgInfo.length === 0) {
      authLog(`Login failed for ${quoted(username)}: no such user`)
      return reply.send({ success: false })
    }
    const { userId, passwordHash } = userOrgInfo?.[0]
    if (!userId) {
      authLog(`Login failed for ${quoted(username)}: no such user`)
      return reply.send({ success: false })
    }

    if (!(await bcrypt.compare(password, passwordHash as string))) {
      authLog(`Login failed for ${quoted(username)}: incorrect password`)
      return reply.send({ success: false })
    }

    // Login successful
    const { JWT, ...userInfo } = await getUserInfo({ userId, sessionId })

    // Back the login with a server-side session, so it can be renewed after the
    // access token expires and revoked by deleting its row. The session records
    // the sessionId that was actually used (getUserInfo mints one if the client
    // didn't supply it), since row-level security evaluates that claim for
    // public applicants and a renewal has to reproduce it exactly.
    const { token, tokenHash, expiresAt } = await createSession({
      userId,
      sessionId: userInfo.user.sessionId,
    })

    authLog(
      `Login: ${quoted(username)} (session ${sessionRef(tokenHash)}, expires ${asTime(expiresAt)})`,
      userInfo.orgList.length > 0 ? `-- ${userInfo.orgList.length} org(s) to choose from` : ''
    )

    // Both tokens are delivered by Set-Cookie and never in the body -- see
    // sessionCookies.ts. Everything else the client needs (user, orgList,
    // templatePermissions) is unchanged.
    setRefreshCookie(reply, token)
    setAccessCookie(reply, JWT)

    reply.send({
      success: true,
      ...userInfo,
      // getUserInfo runs before the session exists, so it can only calculate
      // this. The row is created moments later from the same lifetime, so its
      // value is the one to report.
      sessionExpiry: Math.floor(expiresAt.getTime() / 1000),
    })
  } catch (err) {
    return reply.send({ success: false, error: errorMessage(err) })
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

  const { userId, username, error } = request.auth
  if (error) {
    authLog(`Org login rejected: ${error}`)
    return reply.send({ success: false, message: error })
  }

  // Org is a field on the existing session, not a new session -- same login,
  // same refresh token. Without it on the row, a silent renewal would drop the
  // user back to no organisation (and so lose their org-granted permissions)
  // mid-session. Runs unchanged when switching org or picking "no organisation".
  //
  // Picking an organisation is deliberate user activity, so the session is
  // renewed as well, which is also what makes the row's real deadline available
  // to report back.
  const refreshToken = getRefreshToken(request)
  let session = null

  if (refreshToken) {
    await setSessionOrg(refreshToken, orgId ?? null)
    session = await renewSession(refreshToken, userId)

    if (!session) {
      authLog(`Org login rejected for ${quoted(username)}: no live session`)
      reply.statusCode = 401
      // Revoked, expired and never-existed are deliberately indistinguishable
      return reply.send({ success: false, message: 'Session expired' })
    }

    authLog(
      `Org login: ${quoted(username)} -> ${orgId ? `org ${orgId}` : 'no organisation'}`,
      `(session ${sessionRef(hashRefreshToken(refreshToken))}, expires ${asTime(session.expiresAt)})`
    )
  } else
    authLog(
      `Org login: ${quoted(username)} presented no refresh token,`,
      'so the organisation is not stored against a session'
    )

  const { JWT, ...userInfo } = await getUserInfo({
    userId,
    orgId,
    sessionId,
    sessionExpiresAt: session?.expiresAt,
  })

  // Only the access token is reissued -- it is the one carrying the org claims.
  setAccessCookie(reply, JWT)

  reply.send({ success: true, ...userInfo })
}

/*
Authenticates user using JWT header and returns latest user/org info,
template permissions and new JWT token
*/
/*
The inactivity window runs from the user's last interaction, and only their
browser can see that -- the server sees requests, and a user typing into a long
form makes none. So a browser reports the deadline it has measured and the
session is held to it, rather than being pushed out a full window from whenever
the last request happened to land.

Untrusted, and safe to be: it can only ever ask for LESS than the configured
window (see extendUserSessionIfValid), and it cannot pull back an expiry the
session already has. The worst a caller can do with it is decline to extend its
own session. Absent, malformed and already-past all mean "no deadline offered".
*/
const getIdleDeadline = (idleDeadline: unknown) => {
  const seconds = Number(idleDeadline)
  if (!Number.isFinite(seconds) || seconds <= 0) return undefined
  const deadline = new Date(seconds * 1000)
  return deadline > new Date() ? deadline : undefined
}

const routeUserInfo = async (request: any, reply: any) => {
  const { sessionId, idleDeadline } = request.query
  const { userId, orgId, username, sessionId: returnSessionId, error } = request.auth

  if (error) return reply.send({ success: false, message: error })

  // This is the designated "still here" call: the front end's activity timer
  // hits it while the user is actually interacting, so it must extend the
  // session whether or not a token happened to be minted for this request.
  // Everything else extends expiry only as a side effect of minting.
  //
  // Renewed before anything else is looked up, so a caller whose session has
  // gone is told immediately rather than being handed a fresh deadline for a
  // session that no longer exists -- which would leave it sitting quietly until
  // that deadline, making no valid requests.
  const refreshToken = getRefreshToken(request)
  const session = refreshToken
    ? await renewSession(refreshToken, userId, getIdleDeadline(idleDeadline))
    : null

  if (refreshToken && !session) {
    authLog(`Session expired or revoked for ${quoted(username)}`)
    reply.statusCode = 401
    // Revoked, expired and never-existed are deliberately indistinguishable
    return reply.send({ success: false, message: 'Session expired' })
  }

  if (session)
    authLog(
      `Session extended for ${quoted(username)} to ${asTime(session.expiresAt)}`,
      `(session ${sessionRef(hashRefreshToken(refreshToken as string))})`
    )

  const { JWT, ...userData } = await getUserInfo({
    userId,
    orgId,
    sessionId: sessionId ?? returnSessionId,
    sessionExpiresAt: session?.expiresAt,
  })

  // This check is to prevent a user remaining logged in as a different user if
  // the snapshot changes and their userId corresponds to a different username
  // on the new system. So we check that the username matches the one from the
  // JWT too, and return error if no match
  if (userData.user.username !== username) {
    authLog(
      `Rejected ${quoted(username)}: user ${userId} is now`,
      `${quoted(userData.user.username)} -- the data was probably replaced`
    )
    return reply.send({ success: false, message: 'Invalid username' })
  }

  setAccessCookie(reply, JWT)

  return reply.send({ success: true, ...userData })
}

/*
Ends the user's sessions and expires their cookies. Note the deliberate
asymmetry with login: logging in elsewhere revokes nothing (several browsers
must keep working), while an explicit logout ends them all 
*/
const routeLogout = async (request: any, reply: any) => {
  const { userId, username, error } = request.auth
  if (error) {
    authLog(`Logout rejected: ${error}`)
    return reply.send({ success: false, message: error })
  }

  const refreshToken = getRefreshToken(request)
  const sessionsEnded = await endSessions(userId, refreshToken)

  authLog(`Logout: ${quoted(username)} -- ${sessionsEnded} session(s) ended`)

  // Without this the browser keeps presenting a cookie whose row is gone
  clearAuthCookies(reply)

  return reply.send({ success: true, sessionsEnded })
}

const routeUserPermissions = async (request: any, reply: any) => {
  const { auth, query } = request
  if (!query || (!query.username && !query.orgId))
    return reply.send({
      success: false,
      message: 'Missing username or orgId in query.',
    })

  const username =
    query?.username === '' || query?.username === 'null' ? null : (query?.username ?? null)
  const orgId: number | null =
    query?.orgId === 'null' || query?.orgId === '0'
      ? null
      : query?.orgId
        ? Number(query.orgId)
        : null

  if (auth.error) return reply.send({ success: false, message: auth.console.error })

  const isSystemOrg = orgId ? await databaseConnect.isInternalOrg(orgId) : false

  const templatePermissionRows = await databaseConnect.getTemplatePermissions(isSystemOrg)

  let grantedPermissions: string[] = []
  let availablePermissions: string[] = []

  if (username) {
    // Get permissions for organisation and which have been granted to user
    const userExistingPermissions = await databaseConnect.getUserTemplatePermissions(
      username,
      orgId
    )

    grantedPermissions = Array.from(
      new Set(userExistingPermissions.map((p) => p.permissionName))
    ).sort()
    availablePermissions = Array.from(
      new Set(
        Object.values(templatePermissionRows)
          .filter(({ permissionName }) => !grantedPermissions.includes(permissionName))
          .map((p) => p.permissionName)
      )
    ).sort()
  } else {
    // Get permissions for organisation without association with as user
    const orgExistingPermissions = await databaseConnect.getOrgTemplatePermissions(orgId ?? 0)

    grantedPermissions = Array.from(
      new Set(orgExistingPermissions.map((p) => p.permissionName))
    ).sort()
    availablePermissions = Array.from(
      new Set(
        Object.values(templatePermissionRows)
          .filter(({ permissionName }) => !grantedPermissions.includes(permissionName))
          .map((p) => p.permissionName)
      )
    ).sort()
  }

  // Store array of object per permissionNames with properties and an array of templateCodes
  const templatePermissions: PermissionDetails[] = Object.values(
    templatePermissionRows.reduce(
      (
        templatePermissions,
        {
          permissionNameId,
          permissionName,
          templateCode,
          description,
          policyName,
          isSystemOrgPermission,
        }
      ) => {
        if (!templatePermissions[permissionName])
          templatePermissions[permissionName] = {
            id: permissionNameId,
            name: permissionName,
            description,
            displayName: startCase(permissionName),
            policyName,
            isSystemOrgPermission,
            isUserGranted: grantedPermissions.includes(permissionName),
            templateCodes: [],
          }
        if (
          !!templateCode &&
          !templatePermissions[permissionName].templateCodes.includes(templateCode)
        )
          templatePermissions[permissionName].templateCodes.push(templateCode)
        return templatePermissions
      },
      {}
    )
  )

  return reply.send({
    templatePermissions,
    grantedPermissions,
    availablePermissions,
  })
}

const routeUpdateRowPolicies = async (_request: any, reply: any) => {
  // TODO, add parameters to only drop specific policies, for now drop and reinstate them all

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
    return reply.send({ success: false, message: errorMessage(err) })
  }
}

// Unique name/email/organisation/other check
const routeCheckUnique = async (request: any, reply: any) => {
  const { type, value, table, field, caseInsensitive } = request.query
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
    const isUnique = await databaseConnect.isUnique(
      tableName,
      fieldName,
      value,
      caseInsensitive == 'false' ? false : true
    )
    reply.send({
      unique: isUnique,
      message: '',
    })
  } catch (err) {
    reply.send({ unique: false, message: errorMessage(err) })
  }
}

export {
  routeUserInfo,
  routeUserPermissions,
  routeLogin,
  routeLoginOrg,
  routeLogout,
  routeUpdateRowPolicies,
  routeCreateHash,
  routeVerification,
  routeCheckUnique,
}
