import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import Pattern from 'custom_string_patterns'

const serialGenerator = new Pattern(/[A-Z]{3}-<+dddd>/, { counterInit: 100 })

async function generateSerial({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  // const { patternString } = parameters

  try {
    const generateSerial = await serialGenerator.gen()
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { generateSerial },
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
