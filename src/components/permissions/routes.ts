import databaseConnect from '../databaseConnect'
import { getUsername, getUserInfo } from './loginHelpers'
import { updateRowPolicies } from './rowLevelPolicyHelpers'

const routeUserPermissions = async (request: any, reply: any) => {
  const token = (request?.headers?.authorization || '').replace('Bearer ', '')
  const username = await getUsername(token)
  return reply.send(await getUserInfo(username))
}

const routeLogin = async (request: any, reply: any) => {
  const { username, passwordHash } = request.body || { username: '', passwordHash: '' }

  if (!(await databaseConnect.verifyUser(username, passwordHash)))
    return reply.send({ success: false })

  return reply.send({
    success: true,
    ...(await getUserInfo(username)),
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

export { routeUserPermissions, routeLogin, routeUpdateRowPolicies }
