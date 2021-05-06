import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'

const createUser: ActionPluginType = async ({ parameters, DBConnect }) => {
  const user = parameters
  try {
    console.log(`\nAdding new user: ${user.username}`)
    const result = await DBConnect.createUser(user)
    if (result.success)
      return {
        status: ActionQueueStatus.Success,
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
        status: ActionQueueStatus.Fail,
        error_log: 'There was a problem creating new user.',
      }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem creating new user.',
    }
  }
}

export default createUser
