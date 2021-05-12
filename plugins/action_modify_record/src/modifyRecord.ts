import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'

const modifyRecord: ActionPluginType = async ({ parameters, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { tableName, matchField, matchValue, ...record } = parameters

  const fieldToMatch = matchField ?? 'id'
  const valueToMatch = matchValue ?? record[fieldToMatch]

  // Don't update fields with NULL
  for (const key in record) {
    if (record[key] === null) delete record[key]
  }

  const isUpdate = await db.doesRecordExist(tableName, fieldToMatch, valueToMatch)

  let result: any = {}
  try {
    if (isUpdate) {
      // UPDATE
      console.log(`Updating ${tableName} record: ${JSON.stringify(record, null, 2)}`)
      result = await db.updateRecord(tableName, fieldToMatch, valueToMatch, record)
    } else {
      // CREATE NEW
      console.log(`Creating ${tableName} record: ${JSON.stringify(record, null, 2)}`)
      result = await db.createRecord(tableName, record)
    }
    if (result.success) {
      console.log(
        `${isUpdate ? 'Updated' : 'Created'} ${tableName} record, ID: `,
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
