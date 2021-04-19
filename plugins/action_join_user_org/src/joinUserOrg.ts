import { ActionPluginInput } from '../../types'

// const joinUserOrg = async function ({ applicationData, ...userOrg }: any, DBConnect: any) {
const joinUserOrg = async function ({ parameters: userOrg, DBConnect }: ActionPluginInput) {
  // const userOrg = parameters
  try {
    console.log(`\nAdding user to organisation...`)
    const result = await DBConnect.addUserOrg(userOrg)
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
      error_log: 'There was a problem adding user to organisation',
    }
  }
}

export default joinUserOrg
