async function changeOutcome(parameters: any, DBConnect: any) {
  const { applicationId, newOutcome } = parameters
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
