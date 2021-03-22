module.exports['joinUserOrg'] = async function (userOrg: any, DBConnect: any) {
  try {
    console.log(`\nAdding user to organisation...`)
    const { applicationData, applicationdata, ...orgInfo } = userOrg
    const result = await DBConnect.addUserOrg(orgInfo)
    if (result.success)
      return {
        status: 'Success',
        error_log: '',
        output: {
          userOrgId: result.userOrgId,
        },
      }
    else
      return {
        status: 'Fail',
        error_log: 'There was a problem adding user to organisation.',
      }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem adding user to organisation: ' + error.message,
    }
  }
}
