import databaseConnect from '../databaseConnect'
import config from '../../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { PermissionRow, TemplatePermissions, UserInfo } from './types'
import { compileJWT } from './rowLevelPolicyHelpers'
import { Organisation, UserOrg } from '../../types'

const verifyPromise: any = promisify(verify)
const signPromise: any = promisify(sign)

const extractJWTFromHeader = (request: any) =>
  (request?.headers?.authorization || '').replace('Bearer ', '')

const getTokenData = async (jwtToken: string) => {
  try {
    const data = await verifyPromise(jwtToken, config.jwtSecret)
    return data
  } catch (err) {
    console.log('Cannot parse JWT')
    throw err
  }
}

type UserOrgParameters = {
  username?: string
  userId?: number
  orgId?: number
}

const getUserInfo = async (userOrgParameters: UserOrgParameters) => {
  const { username, userId, orgId } = userOrgParameters

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
    .map((org) => {
      // Destructuring extracts only the relevant fields
      const { orgId, orgName, userRole, licenceNumber, address } = org
      return {
        orgId,
        orgName,
        userRole,
        licenceNumber,
        address,
      }
    })

  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(newUsername)

  const selectedOrg = orgId ? orgList.filter((org) => org.orgId === orgId) : undefined

  return {
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT({
      userId: userId || newUserId,
      orgId,
      templatePermissionRows,
    }),
    user: {
      userId: userId || newUserId,
      username: username || newUsername,
      firstName,
      lastName,
      email,
      dateOfBirth,
      organisation: selectedOrg?.[0],
    },
    orgList,
  }
}

const buildTemplatePermissions = (templatePermissionRows: Array<PermissionRow>) => {
  const templatePermissions: TemplatePermissions = {}

  templatePermissionRows.forEach(({ permissionType, templateCode }: PermissionRow) => {
    if (!templateCode || !permissionType) return
    if (!templatePermissions[templateCode]) templatePermissions[templateCode] = []
    templatePermissions[templateCode].push(permissionType)
  })

  return templatePermissions
}

const getSignedJWT = async (JWTelements: object) => {
  return await signPromise(compileJWT(JWTelements), config.jwtSecret)
}

export { extractJWTFromHeader, getUserInfo, getTokenData }
