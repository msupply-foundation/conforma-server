import databaseConnect from '../databaseConnect'
import { getUserInfo, getTokenData, extractJWTFromHeader } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'

const saltRounds = 10 // For bcrypt salting: 2^saltRounds = 1024

// Authenticates user using JWT header and returns latest user/org info,
// template permissions and new JWT token
const routeUserInfo = async (request: any, reply: any) => {
  const token = extractJWTFromHeader(request)
  const { username, orgId } = await getTokenData(token)
  return reply.send(await getUserInfo({ username, orgId }))
}

// Authenticates login and returns:
// - userInfo
// - list of organisations belonging to user
// - template permissions
// - JWT
const routeLogin = async (request: any, reply: any) => {
  const { username, password } = request.body || { username: '', password: '' }
  const user = (await databaseConnect.getUserDataByUsername(username)) || {}

  if (!user.passwordHash) return reply.send({ success: false })

  if (!(await bcrypt.compare(password, user.passwordHash))) return reply.send({ success: false })

  // Login successful
  const userInfo = await getUserInfo(user)
  const orgList = await databaseConnect.getUserOrgs(user.userId)

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
  const token = extractJWTFromHeader(request)
  const { userId: tokenUserId, username } = await getTokenData(token)

  if (userId !== tokenUserId) return reply.send({ success: false, message: 'Unauthorized request' })
  const orgList = await databaseConnect.getUserOrgs(userId)
  if (orgList.filter((org) => org.orgId === orgId).length === 0)
    return reply.send({ success: false, message: 'User does not belong to organisation' })

  reply.send({ success: true, ...(await getUserInfo({ username, orgId })) })
}

const routeCreateHash = async (request: any, reply: any) => {
  const { password } = request.body
  const hash = await bcrypt.hash(password, saltRounds)
  return reply.send({
    hash,
  })
}

const routeUpdateRowPolicies = async (request: any, reply: any) => {
  // const token = extractJWTFromHeader(request)
  // const username = await getUsername(token)
  // return reply.send(await getUserInfo(username))

  // TO DO, check for admin

  // TODO, add parameters to only drop specific policies, for now drop and reinstante them all

  return reply.send(await updateRowPolicies())
}

export { routeUserInfo, routeLogin, routeLoginOrg, routeUpdateRowPolicies, routeCreateHash }
