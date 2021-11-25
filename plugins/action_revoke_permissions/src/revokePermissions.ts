import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'

const revokePermissions = async ({ applicationData, parameters, DBConnect }: ActionPluginInput) => {
  const db = databaseMethods(DBConnect)
  // Don't specify orgName/Id default because we might be targeting a permission_join with no user (even if application has organisation)
  const { username = applicationData?.username, orgName, orgId, permissionNames, isRemovingPermission = true } = parameters
  try {
    const result = Boolean(orgName || orgId)
      ? await db.revokePermissionFromUserOrg(
          username,
          orgName || Number(orgId),
          permissionNames,
          isRemovingPermission
        )
      : await db.revokePermissionFromUser(username, permissionNames)

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { revokedPermissions: result },
    }
  } catch (error) {
    console.log(error)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}
export default revokePermissions
