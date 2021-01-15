import databaseConnect from '../databaseConnect'
import { getUserInfo, getTokenData, extractJWTFromHeader } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'
import bcrypt from 'bcrypt'

const saltRounds = 10 // For bcrypt salting: 2^saltRounds = 1024

const routeCreateHash = async (request: any, reply: any) => {
  const { password } = request.body
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

  const userOrgInfo = (await databaseConnect.getUserOrgData({ username })) || {}

  const { userId, firstName, lastName, email, dateOfBirth, passwordHash } = userOrgInfo[0]

  if (!(await bcrypt.compare(password, passwordHash))) return reply.send({ success: false })

  // Login successful:
  const orgList = userOrgInfo
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

  reply.send({
    success: true,
    ...(await getUserInfo({
      user: { userId, username, firstName, lastName, email, dateOfBirth },
      orgList,
    })),
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
  const token = extractJWTFromHeader(request)
  const { userId } = await getTokenData(token)

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
  const token = extractJWTFromHeader(request)
  const { userId, orgId } = await getTokenData(token)

  return reply.send(await getUserInfo({ userId, orgId }))
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
