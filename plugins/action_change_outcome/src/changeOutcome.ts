import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'

const changeOutcome: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const newOutcome = parameters.newOutcome
  try {
    console.log(`\nUpdating application: ${newOutcome}`)
    const success = await DBConnect.setApplicationOutcome(applicationId, newOutcome)
    if (success)
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          applicationId,
          newOutcome,
        },
      }
    else
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'There was a problem updating the application.',
      }
  } catch (error) {
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem updating the application.',
    }
  }
}

export default changeOutcome
