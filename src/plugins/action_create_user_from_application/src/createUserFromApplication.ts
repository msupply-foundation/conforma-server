import { BasicObject } from '@openmsupply/expression-evaluator/lib/types'

const responseMap = {
  // Change these when question codes change
  username: 'Q3',
  first_name: 'Q1',
  last_name: 'Q2',
  email: 'Q4',
  password_hash: 'Q5',
}

module.exports['createUserFromApplication'] = async function (parameters: any, DBConnect: any) {
  const { applicationId } = parameters
  const user: BasicObject = {}
  try {
    console.log('Attempting to fetch user details...')
    const sqlQuery =
      "SELECT code, value -> 'text' as value FROM application_response JOIN template_element ON template_element.id = application_response.template_element_id WHERE application_id = $1;"
    const result = await DBConnect.query({ text: sqlQuery, values: [applicationId] })
    const applicationResponses: any = {}
    result.rows.map((row: any) => {
      applicationResponses[row.code] = row.value
    })

    user.username = applicationResponses[responseMap.username]
    user.first_name = applicationResponses[responseMap.first_name]
    user.last_name = applicationResponses[responseMap.last_name]
    user.email = applicationResponses[responseMap.email]
    user.password_hash = applicationResponses[responseMap.password_hash]
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Unable to fetch user details from application',
    }
  }
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
