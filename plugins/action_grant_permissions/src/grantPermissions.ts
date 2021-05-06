import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'

const grantPermissions = async ({ parameters, DBConnect }: ActionPluginInput) => {
  const { username, orgName, permissionNames } = parameters
  try {
    console.log('\nGranting permission/s:')
    console.log({ username, orgName, permissionNames })

    const permissionJoinIds = []
    const outputNames = []

    for (const permissionName of permissionNames) {
      const permissionJoinId = orgName
        ? await DBConnect.joinPermissionNameToUserOrg(username, orgName, permissionName)
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
