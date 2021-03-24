module.exports['createUser'] = async function ({ applicationData, ...user }: any, DBConnect: any) {
  try {
    console.log(`\nAdding new user: ${user.username}`)
    const result = await DBConnect.createUser(user)
    if (result.success)
      return {
        status: 'Success',
        error_log: '',
        output: {
          userId: result.userId,
          username: user.username,
          firstName: user?.first_name,
          lastName: user?.last_name,
          email: user.email,
        },
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
