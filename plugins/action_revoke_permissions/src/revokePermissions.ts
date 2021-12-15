import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'
import grantPermissionsDBMethods from '../../action_grant_permissions/src/databaseMethods'

const revokePermissions = async ({ applicationData, parameters, DBConnect }: ActionPluginInput) => {
  const db = databaseMethods(DBConnect)
  const dbCommon = grantPermissionsDBMethods(DBConnect)
  // Don't specify orgName/Id default because we might be targeting a permission_join with no user (even if application has organisation)
  const { username, orgName, permissionNames, isRemovingPermission = true } = parameters

  try {
    const userId =
      parameters?.userId === null
        ? null
        : parameters?.userId ?? (await dbCommon.getUserIdFromUsername(username))

    if (userId === undefined)
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'Invalid or missing userId or username',
        output: {},
      }

    const orgId =
      parameters?.orgId === null
        ? null
        : parameters?.orgId ?? (await dbCommon.getOrgIdFromOrgname(orgName))

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

    const permissions = await dbCommon.getPermissionIdsFromNames(permissionNames)
    const permissionIds = permissions.map((p: { id: number; name: string }) => p.id)

    console.log('permissionIds', permissionIds)

    const outputObject = {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {},
    }

    if (permissions.length !== permissionNames.length)
      outputObject.error_log = 'WARNING: At least one permission name was invalid '

    const result =
      orgId && userId
        ? // Both user and org
          await db.revokePermissionFromUserOrg(userId, orgId, permissionIds, isRemovingPermission)
        : userId
        ? // User only, no org
          await db.revokePermissionFromUser(userId, permissionIds, isRemovingPermission)
        : // Org only, no user
          orgId && (await db.revokePermissionFromOrg(orgId, permissionIds, isRemovingPermission))

    console.log('Revoked permissions:')
    console.log(
      `User: ${username ?? userId}, Org: ${orgName ?? orgId}, Permissions: ${JSON.stringify(
        result
      )}`
    )

    outputObject.output = { revokedPermissions: result }

    return outputObject
  } catch (error) {
    console.log(error)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}
export default revokePermissions
