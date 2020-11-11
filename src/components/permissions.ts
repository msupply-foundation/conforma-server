import databaseConnect from './databaseConnect'
import config from '../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'

type PermissionType = 'Apply' | 'Review' | 'Assign'

interface PermissionRow {
  permissionType: PermissionType
  templateName: String
}

interface TemplatePermissions {
  [index: string]: Array<PermissionType>
}

const verifyPromise: any = promisify(verify)

const routeUserPermissions = async (request: any, reply: any) => {
  return reply.send(
    await getUserPermissions((request?.headers?.authorization || '').replace('Bearer ', ''))
  )
}

const routeLogin = async (request: any, reply: any) => {
  const { username, passwordHash } = request.body || { username: '', passwordHash: '' }

  if (!(await databaseConnect.verifyUser(username, passwordHash)))
    return reply.send({ success: false })

  return reply.send({
    success: true,
    ...(await getUserPermissions((request?.headers?.authorization || '').replace('Bearer ', ''))),
  })
}

const getUsername = async (jwtToken: string) => {
  let username = 'nonRegistered'
  if (jwtToken) {
    try {
      username = (await verifyPromise(jwtToken, config.jwtSecret)).username
    } catch (e) {
      console.log('cannot verify JWT in authorisation header')
    }
  }
  console.log('username', username)

  return username
}

const getTemplatePermissions = (templatePermissionRows: Array<PermissionRow>) => {
  const templatePermissions: TemplatePermissions = {} // TODO add type

  templatePermissionRows.forEach(({ permissionType, templateName }: any) => {
    if (!templatePermissions[templateName]) templatePermissions[templateName] = []
    templatePermissions[templateName].push(permissionType)
  })

  return templatePermissions
}

const getJWT = (templatePermissionRows: Array<PermissionRow>) => {
  return 'not implemented'
}

const getUserPermissions = async (jwtToken: string) => {
  const username = await getUsername(jwtToken)
  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(username)

  return {
    username,
    templatePermissions: getTemplatePermissions(templatePermissionRows),
    JWT: getJWT(templatePermissionRows),
  }
}

export { routeUserPermissions, routeLogin }
