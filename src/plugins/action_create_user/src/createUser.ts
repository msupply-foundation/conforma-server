import DBConnect from '../../../components/databaseConnect'

module.exports['createUser'] = async function (user: any) {
  try {
    console.log(`\nAdding new user: ${user.username}`)
    const success = await DBConnect.createUser(user)
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
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem creating new user.',
    }
  }
}
