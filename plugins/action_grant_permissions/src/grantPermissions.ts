import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'

const grantPermissions = async ({ parameters, DBConnect }: ActionPluginInput) => {
  const { username, orgName, orgId, permissionNames } = parameters
  try {
    console.log('\nGranting permissions:')
    console.log({ username, orgName, orgId, permissionNames })

    const permissionJoinIds = []
    const outputNames = []

    for (const permissionName of permissionNames) {
      const permissionJoinId =
        orgName || orgId // Can use either one to create a permission_join with a company
          ? await DBConnect.joinPermissionNameToUserOrg(username, orgName || orgId, permissionName)
          : await DBConnect.joinPermissionNameToUser(username, permissionName)
      permissionJoinIds.push(permissionJoinId)
      if (permissionJoinId) outputNames.push(permissionName)
    }
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        permissionJoinIds,
        permissionNames: outputNames,
      },
    }
  } catch (error) {
    console.log(error)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem in grantPermissions Plugin',
    }
  }
}
export default grantPermissions
