module.exports['createUserFromApplication'] = async function (applicationId: any, DBConnect: any) {
  try {
    console.log('Attempting to fetch user details...')
    const sqlQuery =
      "SELECT code, value -> 'text' as value FROM application_response JOIN template_element ON template_element.id = application_response.template_element_id WHERE application_id = $1;"
    const applicationResponses = await DBConnect.query({ text: sqlQuery, values: [applicationId] })
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Unable to fetch user details from application',
    }
  }
  try {
    console.log(`\nAdding new user: ${user.username}`)
    // const result = await DBConnect.createUser(user)
    // if (result.success)
    //   return {
    //     status: 'Success',
    //     error_log: '',
    //     output: {
    //       userId: result.userId,
    //       username: user.username,
    //       firstName: user?.first_name,
    //       lastName: user?.last_name,
    //       email: user.email,
    //     },
    //   }
    // else
    //   return {
    //     status: 'Fail',
    //     error_log: 'There was a problem creating new user.',
    //   }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem creating new user.',
    }
  }
}
