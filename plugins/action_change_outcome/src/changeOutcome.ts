import { ActionPluginInput } from '../../types'

async function changeOutcome({ parameters, applicationData, DBConnect }: ActionPluginInput) {
  const applicationId = parameters?.applicationId || applicationData.applicationId
  const newOutcome = parameters.newOutcome
  try {
    console.log(`\nUpdating application: ${newOutcome}`)
    const success = await DBConnect.setApplicationOutcome(applicationId, newOutcome)
    if (success)
      return {
        status: 'Success',
        error_log: '',
        output: {
          applicationId,
          newOutcome,
        },
      }
    else
      return {
        status: 'Fail',
        error_log: 'There was a problem updating the application.',
      }
  } catch (error) {
    return {
      status: 'Fail',
      error_log: 'There was a problem updating the application.',
    }
  }
}

export default changeOutcome
