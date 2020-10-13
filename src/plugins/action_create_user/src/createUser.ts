module.exports['createUser'] = async function (user: any, PostgresDB: any) {
  try {
    console.log(`\nAdding new user: ${user.username}`)
    const success = await PostgresDB.createUser(user)
    if (success)
      return {
        status: 'Success',
        error_log: '',
      }
    else
      return {
        status: 'Fail',
        error_log: 'There was a problem creating new user.',
      }
  } catch (error) {
    return {
      status: 'Fail',
      error_log: 'There was a problem creating new user.',
    }
  }
}
