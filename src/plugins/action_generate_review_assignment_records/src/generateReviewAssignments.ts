module.exports['generateReviewAssignments'] = async function (input: any, DBConnect: any) {
  try {
    const { appId, userId, templateId } = input

    if 

    // console.log(`\nAdding new user: ${user.username}`)
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
    //     error_log: 'Problem creating review_assignment records.',
    //   }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Problem creating review_assignment records.',
    }
  }
}
