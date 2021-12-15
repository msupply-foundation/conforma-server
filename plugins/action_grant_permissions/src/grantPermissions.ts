import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'

const grantPermissions = async ({ applicationData, parameters, DBConnect }: ActionPluginInput) => {
  const db = databaseMethods(DBConnect)

  // Don't specify default username/userId, orgName/Id default because we might
  // be wanting to add a permission without org or user restriction on it
  const { username, orgName, permissionNames } = parameters

  try {
    const userId =
      parameters?.userId === null
        ? null
        : parameters?.userId ?? (await db.getUserIdFromUsername(username))

    if (userId === undefined)
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'Invalid or missing userId or username',
        output: {},
      }

    const orgId =
      parameters?.orgId === null
        ? null
        : parameters?.orgId ?? (await db.getOrgIdFromOrgname(orgName))

    if (orgId === undefined)
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'Invalid or missing orgId or orgName',
        output: {},
      }

    if (!userId && !orgId)
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'user and org cannot both be null',
        output: {},
      }

    const permissions = await db.getPermissionIdsFromNames(permissionNames)

    const outputObject = {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {},
    }

    if (permissions.length !== permissionNames.length)
      outputObject.error_log = 'WARNING: At least one permission name was invalid '

    console.log('\nGranting permissions:')
    console.log(
      `User: ${username ?? userId}, Org: ${orgName ?? orgId}: Permissions: ${permissions.map(
        (p: { name: string }) => p.name
      )}`
    )

    const permissionJoinIds = []
    const outputNames = []

    for (const { id: permissionId, name: permissionName } of permissions) {
      const permissionJoinId =
        orgId && userId
          ? // Both user and org
            await db.joinPermissionToUserOrg(userId, orgId, permissionId)
          : userId
          ? // User only, no org
            await db.joinPermissionToUser(userId, permissionId)
          : // Org only, no user
            orgId && (await db.joinPermissionToOrg(orgId, permissionId))
      permissionJoinIds.push(permissionJoinId)
      if (permissionJoinId) outputNames.push(permissionName)
    }

    outputObject.output = { permissionJoinIds, permissionNames: outputNames }
    return outputObject
  } catch (error) {
    console.log(error)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}
export default grantPermissions
