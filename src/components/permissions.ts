import databaseConnect from './databaseConnect'
import config from '../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'

type PermissionType = 'Apply' | 'Review' | 'Assign'

interface PermissionRow {
  permissionType: PermissionType
  templateCode: string
}

interface TemplatePermissions {
  [index: string]: Array<PermissionType>
}

const verifyPromise: any = promisify(verify)
const signPromise: any = promisify(sign)

const routeUserPermissions = async (request: any, reply: any) => {
  const token = (request?.headers?.authorization || '').replace('Bearer ', '')
  const username = await getUsername(token)
  return reply.send(await getUserPermissions(username))
}

const routeLogin = async (request: any, reply: any) => {
  const { username, passwordHash } = request.body || { username: '', passwordHash: '' }

  if (!(await databaseConnect.verifyUser(username, passwordHash)))
    return reply.send({ success: false })

  return reply.send({
    success: true,
    ...(await getUserPermissions(username)),
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

  return username
}

const getTemplatePermissions = (templatePermissionRows: Array<PermissionRow>) => {
  const templatePermissions: TemplatePermissions = {} // TODO add type

  templatePermissionRows.forEach(({ permissionType, templateCode }: PermissionRow) => {
    if (!templatePermissions[templateCode]) templatePermissions[templateCode] = []
    templatePermissions[templateCode].push(permissionType)
  })

  return templatePermissions
}

const getJWT = async (username: String, templatePermissionRows: Array<PermissionRow>) => {
  return await signPromise({ username }, config.jwtSecret) // TODO gaphile/pg row lvl, and token
}

const getUserPermissions = async (username: string) => {
  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(username)

  return {
    username,
    templatePermissions: getTemplatePermissions(templatePermissionRows),
    JWT: await getJWT(username, templatePermissionRows),
  }
}

export { routeUserPermissions, routeLogin }
