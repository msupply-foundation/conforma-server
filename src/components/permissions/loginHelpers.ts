import databaseConnect from '../databaseConnect'
import config from '../../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { PermissionRow, TemplatePermissions, UserInfo } from './types'
import { compileJWT } from './rowLevelPolicyHelpers'

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

// type UserOrgParameters = {
//   username?: string
//   userId?: number
//   orgId?: number
// }

const getUserInfo = async (userOrgParameters: any) => {
  const { user, userId, orgList, orgId } = userOrgParameters

  const userOrgData: any =
    // Only refetch from database if user & orgList not supplied
    user && orgList ? {} : await databaseConnect.getUserOrgData({ userId: userId || user?.id })

  const { username, firstName, lastName, email, dateOfBirth } = user ? user : userOrgData?.[0]

  const newOrgList = orgList
    ? orgList
    : userOrgData
        .filter((item: any) => item.orgId)
        .map((org: any) => {
          return {
            orgId: org.orgId,
            orgName: org.orgName,
            userRole: org.userRole,
          }
        })

  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(username)

  const selectedOrg = orgId ? newOrgList.filter((org: any) => org.orgId === orgId) : undefined

  if (selectedOrg) user.organisation = selectedOrg

  return {
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT({
      userId: userId ? userId : user.userId,
      orgId,
      templatePermissionRows,
    }),
    user: {
      userId: userId ? userId : user.userId,
      username,
      firstName,
      lastName,
      email,
      dateOfBirth,
      organisation: selectedOrg,
    },
    orgList: newOrgList,
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
