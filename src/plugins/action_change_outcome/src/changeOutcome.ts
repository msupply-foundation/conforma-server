module.exports['changeOutcome'] = async function (parameters: any, PostgresDB: any) {
  const { application_id, newOutcome } = parameters
  try {
    console.log(`\nUpdating application: ${newOutcome}`)
    const success = await PostgresDB.setApplicationOutcome(application_id, newOutcome)
    if (success)
      return {
        status: 'Success',
        error_log: '',
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
