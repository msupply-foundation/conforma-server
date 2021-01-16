import databaseConnect from '../databaseConnect'
import { getUserInfo, getTokenData, extractJWTfromHeader } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'
import { Organisation, User, UserOrg } from '../../types'

const saltRounds = 10 // For bcrypt salting: 2^saltRounds = 1024

const routeCreateHash = async (request: any, reply: any) => {
  const { password } = request.body

  // bcrypt hash output includes salt and other metadata in string
  // See https://github.com/kelektiv/node.bcrypt.js#hash-info
  const hash = await bcrypt.hash(password, saltRounds)
  return reply.send({
    hash,
  })
}

/*
Authenticates login and returns:
  - userInfo
  - list of organisations belonging to user
  - template permissions
  - JWT containing permissions and userId
*/
const routeLogin = async (request: any, reply: any) => {
  const { username, password } = request.body
  if (password === undefined) return reply.send({ success: false })

  const userOrgInfo: UserOrg[] = (await databaseConnect.getUserOrgData({ username })) || {}

  const { userId, firstName, lastName, email, dateOfBirth, passwordHash } = userOrgInfo[0]

  if (!(await bcrypt.compare(password, passwordHash as string)))
    return reply.send({ success: false })

  // Login successful
  reply.send({
    success: true,
    ...(await getUserInfo({ userId })),
  })
}

/*
Authenticates user and checks they belong to requested org (id). Returns:
  - userInfo (including orgId and orgName)
  - template permissions
  - JWT (with orgId included)
*/
const routeLoginOrg = async (request: any, reply: any) => {
  const { orgId } = request.body
  const token = extractJWTfromHeader(request)
  const { userId, error } = await getTokenData(token)
  if (error) return reply.send({ success: false, message: error })

  const userInfo = await getUserInfo({ userId, orgId })

  if (!userInfo.user.organisation)
    return reply.send({ success: false, message: 'User does not belong to organisation' })

  reply.send({ success: true, ...userInfo })
}

/*
Authenticates user using JWT header and returns latest user/org info,
template permissions and new JWT token
*/
const routeUserInfo = async (request: any, reply: any) => {
  const token = extractJWTfromHeader(request)
  const { userId, orgId, error } = await getTokenData(token)
  if (error) return reply.send({ success: false, message: error })

  return reply.send(await getUserInfo({ userId, orgId }))
}

const routeUpdateRowPolicies = async (request: any, reply: any) => {
  // const token = extractJWTfromHeader(request)
  // const username = await getUsername(token)
  // return reply.send(await getUserInfo(username))

  // TO DO, check for admin

  // TODO, add parameters to only drop specific policies, for now drop and reinstante them all

  return reply.send(await updateRowPolicies())
}

export { routeUserInfo, routeLogin, routeLoginOrg, routeUpdateRowPolicies, routeCreateHash }
