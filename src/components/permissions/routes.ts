import databaseConnect from '../databaseConnect'
import { getUsername, getUserInfo } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'

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

const routeCreateHash = async (request: any, reply: any) => {
  const { password } = request.body

  // bcrypt hash output includes salt and other metadata in string
  // See https://github.com/kelektiv/node.bcrypt.js#hash-info
  const hash = await bcrypt.hash(password, saltRounds)
  return reply.send({
    hash,
  })
}

const routeUpdateRowPolicies = async (request: any, reply: any) => {
  // const token = (request?.headers?.authorization || '').replace('Bearer ', '')
  // const username = await getUsername(token)
  // return reply.send(await getUserInfo(username))

  // TO DO, check for admin

  // TODO, add parameters to only drop specific policies, for now drop and reinstante them all

  return reply.send(await updateRowPolicies())
}

export { routeUserPermissions, routeLogin, routeUpdateRowPolicies, routeCreateHash }
