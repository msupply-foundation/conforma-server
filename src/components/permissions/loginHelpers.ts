import databaseConnect from '../databaseConnect'
import config from '../../config'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { nanoid } from 'nanoid'
import { PermissionRow, TemplatePermissions } from './types'
import { baseJWT, compileJWT } from './rowLevelPolicyHelpers'
import { Organisation, UserOrg } from '../../types'

const verifyPromise: any = promisify(verify)
const signPromise: any = promisify(sign)

const extractJWTfromHeader = (request: any) =>
  (request?.headers?.authorization || '').replace('Bearer ', '')

const getTokenData = async (jwtToken: string) => {
  try {
    const data = await verifyPromise(jwtToken, config.jwtSecret)
    return data
  } catch (err) {
    console.log('Cannot parse JWT')
    return { error: err.message }
  }
}

type UserOrgParameters = {
  username?: string
  userId?: number
  orgId?: number
  sessionId?: string
}

const getUserInfo = async (userOrgParameters: UserOrgParameters) => {
  const { username, userId, orgId, sessionId } = userOrgParameters

  console.log('userOrgParamentes', username, userId, orgId, sessionId)

  const userOrgData: UserOrg[] = await databaseConnect.getUserOrgData({
    userId,
    username,
  })

  console.log('userOrgData', userId, username, userOrgData)

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
    orgId || null
  )

  const selectedOrg = orgId ? orgList.filter((org) => org.orgId === orgId) : undefined

  const returnSessionId = sessionId ?? nanoid(16)

  const isAdmin = !!templatePermissionRows.find((row) => !!row?.isAdmin)

  return {
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT({
      userId: userId || newUserId,
      orgId,
      templatePermissionRows,
      sessionId: returnSessionId,
      isAdmin,
    }),
    user: {
      userId: userId || newUserId,
      username: username || newUsername,
      firstName,
      lastName,
      email,
      dateOfBirth,
      organisation: selectedOrg?.[0],
      sessionId: returnSessionId,
    },
    isAdmin,
    orgList,
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

const getSignedJWT = async (JWTelements: object) => {
  return await signPromise(compileJWT(JWTelements), config.jwtSecret)
}

const getAdminJWT = async () => {
  return await signPromise({ ...baseJWT, isAdmin: true, role: 'postgres' }, config.jwtSecret)
}

export { buildTemplatePermissions, extractJWTfromHeader, getUserInfo, getTokenData, getAdminJWT }
