import { ActionQueueStatus, File } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import { errorMessage } from '../../../src/components/utilityFunctions'

async function getValues({ parameters }: ActionPluginInput): Promise<ActionPluginOutput> {
  try {
    console.log('Passing through values:', parameters)

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { ...parameters },
    }
  } catch (error) {
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: errorMessage(error),
    }
  }
}

export default getValues
