import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'

const joinUserOrg = async function ({ parameters, DBConnect }: ActionPluginInput) {
  const { userId, orgId, user_id, organisation_id, org_id, userRole } = parameters
  try {
    console.log(`\nAdding user to organisation...`)
    const result = await DBConnect.addUserOrg({
      user_id: userId ?? user_id,
      organisation_id: orgId ?? organisation_id ?? org_id,
      user_role: userRole,
    })
    if (result.success)
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          userOrgId: result.userOrgId,
        },
      }
    else
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'There was a problem adding user to organisation.',
      }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default joinUserOrg
