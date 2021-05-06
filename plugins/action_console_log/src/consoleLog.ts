import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'

const consoleLog: ActionPluginType = async ({ parameters }) => {
  try {
    console.log('\nThe Console Log action is running...')
    console.log(parameters.message)
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
    }
  } catch (error) {
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem',
    }
  }
}

export default consoleLog
