import databaseConnect from '../database/databaseConnect'
import config from '../../config'
import { VerifyOptions, verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { nanoid } from 'nanoid'
import { PermissionRow, TemplatePermissions } from './types'
import { baseJWT, compileJWT } from './rowLevelPolicyHelpers'
import { Organisation, UserOrg } from '../../types'
import { errorMessage } from '../utilityFunctions'
import { getAccessTokenLifetimeMinutes, getSessionLifetimeMinutes } from './userSessions'
import { FastifyRequest } from 'fastify'

const verifyPromise: any = promisify(verify)
const signPromise: any = promisify(sign)

const extractJWTfromHeader = (request: any) =>
  (request?.headers?.authorization || '').replace('Bearer ', '')

const getTokenData = async (jwtToken: string, options?: VerifyOptions) => {
  try {
    const data = await verifyPromise(jwtToken, config.jwtSecret, options)
    return data
  } catch (err) {
    console.log('Cannot parse JWT')
    return { error: errorMessage(err) }
  }
}

// Authorised routes have a pre-validation hook to inject "auth" data onto the
// request object. Public routes do not, but a few of them need to check the
// current users permissions. So this function provides basically the same
// functionality, but doesn't reject the request if no auth data is present. It
// can be called from Public routes as required.
const getPublicTokenData = async (request: FastifyRequest) => {
  const token = extractJWTfromHeader(request)
  const { error, ...tokenData } = await getTokenData(token)
  return tokenData
}

type userOrgPermissions = {
  userId: number
  orgId?: number
  permissionNames: string[]
}

type TokenData = {
  userId?: number
  orgId?: number
}

const getPermissionNamesFromJWT = async (tokenData: TokenData): Promise<userOrgPermissions> => {
  const { userId, orgId } = tokenData
  if (!userId) return { userId: 0, orgId: 0, permissionNames: [] }
  const permissionNames = await (
    await databaseConnect.getUserOrgPermissionNames(userId, orgId)
  ).map((result) => result.permissionName)
  return { userId, orgId, permissionNames }
}

type UserOrgParameters = {
  username?: string
  userId?: number
  orgId?: number
  sessionId?: string
  // Overrides the usual short access-token lifetime. Only for tokens issued
  // deliberately by an admin (a GraphQL client, a support session), which have
  // no session behind them to renew against.
  accessTokenLifetimeMinutes?: number
  // The session row's own "expires_at", from the caller that just created or
  // renewed it. Callers with a session to hand should always pass it, so the
  // client is told the deadline the database actually holds.
  sessionExpiresAt?: Date
}

const getUserInfo = async (userOrgParameters: UserOrgParameters) => {
  const { username, userId, orgId, sessionId, accessTokenLifetimeMinutes, sessionExpiresAt } =
    userOrgParameters

  const userOrgData: UserOrg[] = await databaseConnect.getUserOrgData({
    userId,
    username,
  })

  const {
    userId: newUserId,
    username: newUsername,
    firstName,
    lastName,
    email,
    dateOfBirth,
  } = userOrgData?.[0] as UserOrg

  const orgList: Organisation[] = userOrgData
    .filter((item) => item.orgId)
    .map(({ orgId, orgName, userRole, registration, address, logoUrl, isSystemOrg }) => {
      // Destructuring extracts only the relevant fields
      return { orgId, orgName, userRole, registration, address, logoUrl, isSystemOrg }
    })

  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(
    newUsername,
    orgId || null,
    true
  )

  // Also get org-only permissions
  if (orgId)
    templatePermissionRows.push(...(await databaseConnect.getOrgTemplatePermissions(orgId)))

  const selectedOrg = orgId ? orgList.filter((org) => org.orgId === orgId) : undefined

  const returnSessionId = sessionId ?? nanoid(16)

  const managementPrefName =
    config?.systemManagerPermissionName || config.defaultSystemManagerPermissionName

  const { isAdmin, isManager } = await databaseConnect.getUserAdminStatus(
    managementPrefName,
    newUserId,
    orgId ?? null
  )

  return {
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT(
      {
        userId: userId || newUserId,
        username: username || newUsername,
        orgId,
        templatePermissionRows,
        sessionId: returnSessionId,
        isAdmin,
        isManager,
      },
      accessTokenLifetimeMinutes
    ),
    user: {
      userId: userId || newUserId,
      username: username || newUsername,
      permissionNames: Array.from(
        new Set(templatePermissionRows.map(({ permissionName }) => permissionName))
      ),
      firstName,
      lastName,
      email,
      dateOfBirth,
      organisation: selectedOrg?.[0],
      sessionId: returnSessionId,
      isAdmin,
      isManager,
    },
    orgList,
    // The deadline that actually ends the login, as unix seconds. NOT the
    // access token's "exp", which is shorter and renewed silently -- see
    // userSessions.ts
    //
    // Taken from the session row wherever the caller has one, so the client
    // works from the deadline the database holds rather than a second
    // calculation of it. "expires_at" is only ever pushed later (see
    // extendUserSessionIfValid), so a computed value can also be an
    // over-estimate: on a route that doesn't renew, the row still carries the
    // deadline set by whatever renewed it last.
    sessionExpiry: sessionExpiresAt
      ? Math.floor(sessionExpiresAt.getTime() / 1000)
      : parseInt(String(Date.now() / 1000)) + getSessionLifetimeMinutes(userId ?? newUserId) * 60,
  }
}

const buildTemplatePermissions = (templatePermissionRows: Array<PermissionRow>) => {
  const templatePermissions: TemplatePermissions = {}

  templatePermissionRows.forEach(({ permissionType, templateCode }: PermissionRow) => {
    if (!templateCode || !permissionType) return
    if (!templatePermissions[templateCode]) templatePermissions[templateCode] = []
    if (templatePermissions[templateCode].includes(permissionType)) return
    templatePermissions[templateCode].push(permissionType)
  })

  return templatePermissions
}

// Access tokens carry a real "exp", which both surfaces enforce through the
// same check: jsonwebtoken.verify rejects on it, and Postgraphile already calls
// verify, so GraphQL expires tokens with no config of its own.
const getSignedJWT = async (JWTelements: object, lifetimeMinutes?: number) => {
  return await signPromise(compileJWT(JWTelements), config.jwtSecret, {
    expiresIn: (lifetimeMinutes ?? getAccessTokenLifetimeMinutes()) * 60,
  })
}

// Deliberately left unexpiring: this is an immortal superuser token, cached for
// the life of the process (see graphQLConnect.ts and FigTree.ts). Giving it an
// expiry would need re-acquisition logic at both of those cache sites, or
// internal GraphQL starts failing once the TTL passes.
const getAdminJWT = async () => {
  return await signPromise({ ...baseJWT, isAdmin: true, role: 'postgres' }, config.jwtSecret)
}

export {
  extractJWTfromHeader,
  getUserInfo,
  getTokenData,
  getAdminJWT,
  getPublicTokenData,
  getPermissionNamesFromJWT,
}
