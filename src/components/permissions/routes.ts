import databaseConnect from '../databaseConnect'
import { getUsername, getUserInfo, getTokenData } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'
import { userInfo } from 'os'

const saltRounds = 10 // For bcrypt salting: 2^saltRounds = 1024

const routeUserPermissions = async (request: any, reply: any) => {
  const token = (request?.headers?.authorization || '').replace('Bearer ', '')
  const username = await getUsername(token)
  return reply.send(await getUserInfo(username))
}

// Authenticates login and returns:
// - userInfo
// - list of organisations belonging to user
// - template permissions
// - JWT
const routeLogin = async (request: any, reply: any) => {
  const { username, password } = request.body || { username: '', password: '' }
  const { passwordHash } = (await databaseConnect.getUserDataByUsername(username)) || {}

  if (!passwordHash) return reply.send({ success: false })

  if (!(await bcrypt.compare(password, passwordHash))) return reply.send({ success: false })

  // Login successful
  const userInfo = await getUserInfo(username)
  const orgList = await databaseConnect.getUserOrgs(userInfo.user.userId)
  reply.send({
    success: true,
    ...userInfo,
    orgList,
  })
}

// Authenticates user and checks they belong to requested org (id). Returns:
// - userInfo (including orgId and orgName)
// - template permissions
// - JWT (with orgId included)
const routeLoginOrg = async (request: any, reply: any) => {
  const { userId, orgId } = request.body || { userId: '', orgId: '' }
  const token = (request?.headers?.authorization || '').replace('Bearer ', '')
  const { userId: tokenUserId, username } = await getTokenData(token)

  if (userId !== tokenUserId) return reply.send({ success: false, message: 'Unauthorized request' })
  if (!(await databaseConnect.verifyUserInOrganisation(userId, orgId)))
    return reply.send({ success: false, message: 'User does not belong to organisation' })

  reply.send(await getUserInfo(username, orgId))
}

const routeCreateHash = async (request: any, reply: any) => {
  const { password } = request.body
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

export { routeUserPermissions, routeLogin, routeLoginOrg, routeUpdateRowPolicies, routeCreateHash }
