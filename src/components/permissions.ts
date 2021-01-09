import databaseConnect from './databaseConnect'
import config from '../config.json'
import { verify, sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { PermissionPolicyType } from '../generated/graphql'
import bcrypt from 'bcrypt'

type PermissionTypes = keyof typeof PermissionPolicyType

interface PermissionRow {
  permissionType: PermissionTypes
  templateCode: string
}

interface TemplatePermissions {
  [index: string]: Array<PermissionTypes>
}

const verifyPromise: any = promisify(verify)
const signPromise: any = promisify(sign)

const saltRounds = 10 // For bcrypt salting: 2^saltRounds = 1024

const routeUserPermissions = async (request: any, reply: any) => {
  const token = (request?.headers?.authorization || '').replace('Bearer ', '')
  const username = await getUsername(token)
  return reply.send(await getUserInfo(username))
}

const routeLogin = async (request: any, reply: any) => {
  const { username, password } = request.body || { username: '', password: '' }
  const { passwordHash } = (await databaseConnect.getUserDataByUsername(username)) || {}

  if (!passwordHash) return reply.send({ success: false })

  if (!(await bcrypt.compare(password, passwordHash))) return reply.send({ success: false })

  // Login successful
  reply.send({
    success: true,
    ...(await getUserInfo(username)),
  })
}

const createHash = async (request: any, reply: any) => {
  const { password } = request.body
  const hash = await bcrypt.hash(password, saltRounds)
  return reply.send({
    hash,
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

const getUserInfo = async (username: string) => {
  const templatePermissionRows = await databaseConnect.getUserTemplatePermissions(username)
  const {
    id,
    firstName,
    lastName,
    dateOfBirth,
    email,
  } = await databaseConnect.getUserDataByUsername(username)

  return {
    username,
    templatePermissions: buildTemplatePermissions(templatePermissionRows),
    JWT: await getJWT(username, templatePermissionRows),
    user: { id, firstName, lastName, username, dateOfBirth, email },
  }
}

const buildTemplatePermissions = (templatePermissionRows: Array<PermissionRow>) => {
  const templatePermissions: TemplatePermissions = {} // TODO add type

  templatePermissionRows.forEach(({ permissionType, templateCode }: PermissionRow) => {
    if (!templatePermissions[templateCode]) templatePermissions[templateCode] = []
    templatePermissions[templateCode].push(permissionType)
  })

  return templatePermissions
}

const getJWT = async (username: string, templatePermissionRows: Array<PermissionRow>) => {
  return await signPromise({ username }, config.jwtSecret) // TODO gaphile/pg row lvl, and token
}

export { routeUserPermissions, routeLogin, createHash }
