import { identity } from 'lodash'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'
import { errorMessage } from '../../../src/components/utilityFunctions'

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
    console.log(permissions)

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

    const grantedPermissions = []

    for (const { id: permissionNameId, name: permissionName } of permissions) {
      const permissionJoinId =
        orgId && userId
          ? // Both user and org
            await db.joinPermissionToUserOrg(userId, orgId, permissionNameId)
          : userId
          ? // User only, no org
            await db.joinPermissionToUser(userId, permissionNameId)
          : // Org only, no user
            orgId && (await db.joinPermissionToOrg(orgId, permissionNameId))
      if (permissionJoinId)
        grantedPermissions.push({ permissionName, permissionNameId, permissionJoinId })
    }

    outputObject.output = { grantedPermissions }
    return outputObject
  } catch (error) {
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: errorMessage(error),
    }
  }
}
export default grantPermissions
