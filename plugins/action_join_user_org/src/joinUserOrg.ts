import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'

const joinUserOrg = async function ({ parameters: userOrg, DBConnect }: ActionPluginInput) {
  try {
    console.log(`\nAdding user to organisation...`)
    const result = await DBConnect.addUserOrg(userOrg)
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
      error_log: 'There was a problem adding user to organisation',
    }
  }
}

export default joinUserOrg
