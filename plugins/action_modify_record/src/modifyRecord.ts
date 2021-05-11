import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'

const modifyRecord: ActionPluginType = async ({ parameters, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { tableName, ...record } = parameters
  for (const key in record) {
    if (record[key] === null) delete record[key]
  }

  let result: any = {}
  try {
    if (record?.id) {
      // UPDATE
      console.log(`Updating ${tableName} record: ${JSON.stringify(record, null, 2)}`)
      result = await db.updateEntity(tableName, record)
    } else {
      // CREATE NEW
      console.log(`Creating ${tableName} record: ${JSON.stringify(record, null, 2)}`)
      result = await db.createEntity(tableName, record)
    }
    if (result.success) {
      console.log(
        `${record?.id ? 'Updated' : 'Created'} ${tableName} record, ID: `,
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

export default modifyRecord
