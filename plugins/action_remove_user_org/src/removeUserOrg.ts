import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'
import grantPermissionsDBMethods from '../../action_grant_permissions/src/databaseMethods'
import { UserOrg } from '../../../src/types'

const removeUserOrg = async function ({ parameters, DBConnect }: ActionPluginInput) {
  const { username, orgName, deletePermissions = true } = parameters
  const dbCommon = grantPermissionsDBMethods(DBConnect)

  try {
    const userId =
      parameters?.userId === null
        ? null
        : parameters?.userId ??
          parameters?.user_id ??
          (await dbCommon.getUserIdFromUsername(username))

    const orgId =
      parameters?.orgId === null
        ? null
        : parameters?.orgId ??
          parameters?.org_id ??
          parameters?.organisation_id ??
          (await dbCommon.getOrgIdFromOrgname(orgName))

    if (!orgId)
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'Organisation cannot be null or undefined',
        output: {},
      }

    // Remove single pair user-org if orgId and userId is defined
    // Otherwise will remove ALL users from orgId (used when disable org)
    if (userId)
      console.log(`Removing user ${username ?? userId} from organisation ${orgName ?? orgId}...`)
    else console.log(`Removing all users from organisation ${orgName ?? orgId}...`)

    const removed: { pairs: UserOrg[]; success: boolean } = await DBConnect.removeUserOrg({
      orgId,
      userId,
    })
    if (deletePermissions) await DBConnect.deleteUserOrgPermissions({ orgId, userId })
    if (removed.success) {
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          removedUsers: removed.pairs
        },
      }
    } else {
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'There was a problem removing user from organisation.',
      }
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default removeUserOrg
