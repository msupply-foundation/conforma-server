import databaseMethods from './databaseMethods'

module.exports['changeOutcome'] = async function (parameters: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)
  const { applicationId, newOutcome } = parameters
  try {
    console.log(`\nUpdating application: ${newOutcome}`)
    const success = await db.setApplicationOutcome(applicationId, newOutcome)
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
