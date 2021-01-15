import databaseConnect from '../databaseConnect'
import config from '../../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { PermissionRow, TemplatePermissions, UserInfo } from './types'
import { compileJWT } from './rowLevelPolicyHelpers'
import { Organisation, User, UserOrg } from '../../types'

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
  user?: User
  userId?: number
  orgList?: Organisation[]
  orgId?: number
}

const getUserInfo = async (userOrgParameters: UserOrgParameters) => {
  const { user, userId, orgList, orgId } = userOrgParameters

  const userOrgData: UserOrg[] | undefined =
    // Only refetch from database if user & orgList not supplied
    user && orgList
      ? undefined
      : await databaseConnect.getUserOrgData({ userId: userId || user?.userId })

  const { username, firstName, lastName, email, dateOfBirth } = user
    ? user
    : (userOrgData?.[0] as UserOrg)

  const newOrgList: Organisation[] | undefined = orgList
    ? orgList
    : userOrgData &&
      userOrgData
        .filter((item) => item.orgId)
        .map((org) => {
          const { orgId, orgName, userRole, licenceNumber, address } = org
          return {
            orgId,
            orgName,
            userRole,
            licenceNumber,
            address,
          }
        })

  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(username)

  const selectedOrg = orgId
    ? newOrgList && newOrgList.filter((org) => org.orgId === orgId)
    : undefined

  return {
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT({
      userId: userId ? userId : user?.userId,
      orgId,
      templatePermissionRows,
    }),
    user: {
      userId: userId ? userId : user?.userId,
      username,
      firstName,
      lastName,
      email,
      dateOfBirth,
      organisation: selectedOrg?.[0],
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
