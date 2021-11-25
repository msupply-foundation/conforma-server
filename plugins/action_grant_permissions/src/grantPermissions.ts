import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'

const grantPermissions = async ({ applicationData, parameters, DBConnect }: ActionPluginInput) => {
  // Don't specify orgName/Id default because we might be wanting to add a
  // permission without org restriction on it
  const { username = applicationData?.username, orgName, orgId, permissionNames } = parameters
  try {
    console.log('\nGranting permissions:')
    console.log({ username, orgName, orgId, permissionNames })

    const permissionJoinIds = []
    const outputNames = []

    for (const permissionName of permissionNames) {
      const permissionJoinId = Boolean(orgName || orgId) // Can use either one to create a permission_join with a company
        ? await DBConnect.joinPermissionNameToUserOrg(
            username,
            orgName || Number(orgId),
            permissionName
          )
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
      error_log: error.message,
    }
  }
}
export default grantPermissions
