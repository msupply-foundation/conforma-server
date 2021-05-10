import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'

// If field contains this value, it will not be updated in database
const SKIP_KEYWORD = 'SKIP'

const modifyEntity: ActionPluginType = async ({ parameters, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { tableName, ...entity } = parameters
  for (const key in entity) {
    if (entity[key] === SKIP_KEYWORD) delete entity[key]
  }

  let result: any = {}
  try {
    if (entity?.id) {
      // UPDATE
      console.log(`Updating ${tableName} record: ${JSON.stringify(entity, null, 2)}`)
      result = await db.updateEntity(tableName, entity)
    } else {
      // CREATE NEW
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
        output: { [tableName]: result[tableName] },
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
