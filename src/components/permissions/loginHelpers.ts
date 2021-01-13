import databaseConnect from '../databaseConnect'
import config from '../../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { PermissionRow, TemplatePermissions, UserInfo } from './types'
import { compileJWT } from './rowLevelPolicyHelpers'
import { Organisation } from '../../generated/graphql'

const verifyPromise: any = promisify(verify)
const signPromise: any = promisify(sign)

const getTokenData = async (jwtToken: string) => {
  try {
    const data = await verifyPromise(jwtToken, config.jwtSecret)
    return data
  } catch (err) {
    console.log('Cannot parse JWT')
    throw err
  }
}

const getUserInfo = async (username: string, orgId: number | undefined = undefined) => {
  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(username)
  const {
    userId,
    firstName,
    lastName,
    dateOfBirth,
    email,
  } = await databaseConnect.getUserDataByUsername(username)
  const organisation = orgId ? await databaseConnect.getOrgById(orgId) : undefined

  return {
    username,
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getSignedJWT(username, userId, templatePermissionRows, orgId),
    user: { userId, firstName, lastName, username, dateOfBirth, email, organisation },
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

const getSignedJWT = async (
  username: string,
  userId: number,
  templatePermissionRows: Array<PermissionRow>,
  orgId: number | undefined = undefined
) => {
  return await signPromise(
    compileJWT(username, userId, templatePermissionRows, orgId),
    config.jwtSecret
  )
}

export { getUserInfo, getTokenData }
