import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'

const removeUserOrg = async function ({ parameters, DBConnect }: ActionPluginInput) {
  const { userId, orgId, user_id, organisation_id, org_id, deletePermissions = true } = parameters
  const userOrg = {
    userId: userId ?? user_id,
    orgId: orgId ?? org_id ?? organisation_id,
  }
  try {
    console.log(`\Removing user from organisation...`)
    const result = await DBConnect.removeUserOrg(userOrg)

    if (deletePermissions) await DBConnect.deleteUserOrgPermissions(userOrg)

    if (result.success) {
      console.log(`User ${userOrg.userId} removed from organisation ${userOrg.orgId}`)
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          userOrgId: result.id,
          userId: result.user_id,
          orgId: result.organisation_id,
        },
      }
    } else
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'There was a problem removing user from organisation.',
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