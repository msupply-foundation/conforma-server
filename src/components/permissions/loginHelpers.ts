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

type UserOrgParameters = {
  username?: string
  userId?: number
  orgId?: number
}

const getUserInfo = async (userProperties: any) => {
  const { username, userId, orgId } = userProperties

  const user =
    Object.keys(userProperties).length > 3
      ? { ...userProperties }
      : username
      ? await databaseConnect.getUserDataByUsername(username)
      : userId && (await databaseConnect.getUserData(userId))
  delete user?.passwordHash

  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(
    userProperties.username
  )

  return {
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT({ userId: userProperties.userId, templatePermissionRows, orgId }),
    userNew: user,
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
