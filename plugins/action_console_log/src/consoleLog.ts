import { ActionPluginInput } from '../../types'

function consoleLog({ parameters }: ActionPluginInput) {
  try {
    console.log('\nThe Console Log action is running...')
    console.log(parameters.message)
    return {
      status: 'Success',
      error_log: '',
    }
  } catch (error) {
    return {
      status: 'Fail',
      error_log: 'There was a problem',
    }
  }
}

export default consoleLog
