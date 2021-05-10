import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'

const modifyEntity: ActionPluginType = async ({ parameters, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { tableName, ...entity } = parameters
  let result: any = {}
  try {
    if (entity?.id) {
      // Update
      console.log(`Updating ${tableName} record: ${JSON.stringify(entity, null, 2)}`)
      result = await db.updateEntity(tableName, entity)
    } else {
      // Create new
      console.log(`Creating ${tableName} record: ${JSON.stringify(entity, null, 2)}`)
      result = await db.createEntity(tableName, entity)
    }
    if (result.success) {
      console.log(
        `${entity?.id ? 'Updated' : 'Created'} ${tableName} record, ID: `,
        result[tableName].id
      )
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: result, // FIX THIS
      }
    } else {
      console.log('Problem creating or updating record')
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'Problem creating or updating record',
      }
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default modifyEntity
