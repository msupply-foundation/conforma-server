import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import Pattern from 'custom_string_patterns'

async function generateSerial({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  const {} = parameters

  try {
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { field: 'NAME' },
    }
    const generatedString = 'TEMP'

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { generatedName: generatedString },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default generateSerial
