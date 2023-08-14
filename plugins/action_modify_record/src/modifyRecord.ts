import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods, { DatabaseMethodsType } from './databaseMethods'
import { DBConnectType } from '../../../src/components/databaseConnect'
import { mapValues, get } from 'lodash'
import { objectKeysToSnakeCase, getValidTableName } from '../../../src/components/utilityFunctions'
import { generateFilterDataFields } from '../../../src/components/data_display/generateFilterDataFields/generateFilterDataFields'
import config from '../../../src/config'

const modifyRecord: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const {
    tableName,
    matchField,
    matchValue,
    shouldCreateJoinTable = true,
    regenerateDataTableFilters = false,
    data,
    ...record
  } = parameters

  const tableNameProper = getValidTableName(tableName)

  const fieldToMatch = matchField ?? 'id'
  const valueToMatch = matchValue ?? record[fieldToMatch]
  const applicationId = applicationData?.applicationId || 0

  // Build full record
  const fullRecord = objectKeysToSnakeCase({
    ...record,
    ...mapValues(data, (property) => get(applicationData, property, null)),
  })

  // Don't update fields with NULL
  for (const key in fullRecord) {
    if (fullRecord[key] === null || fullRecord[key] === undefined) delete fullRecord[key]
  }

  try {
    await createOrUpdateTable(DBConnect, db, tableNameProper, fullRecord, tableName)

    const recordIds: number[] = await db.getRecordIds(tableNameProper, fieldToMatch, valueToMatch)

    const isUpdate = recordIds.length !== 0
    const isMultiUpdate = recordIds.length > 1

    let result: any[] = []
    if (isUpdate) {
      // UPDATE
      for (const recordId of recordIds) {
        console.log(`Updating ${tableNameProper} record: ${JSON.stringify(fullRecord, null, 2)}`)
        result.push(await db.updateRecord(tableNameProper, recordId, fullRecord))
      }
    } else {
      // CREATE NEW
      console.log(`Creating ${tableNameProper} record: ${JSON.stringify(fullRecord, null, 2)}`)
      const res = await db.createRecord(tableNameProper, fullRecord)
      result.push(res)
      recordIds.push(res.recordId)
    }

    for (const recordId of recordIds) {
      if (shouldCreateJoinTable)
        await db.createJoinTableAndRecord(tableNameProper, applicationId, recordId)
    }

    // Run this one async so we don't block action sequence
    if (regenerateDataTableFilters) generateFilterDataFields(tableName)

    if (result.some((result) => !result.success))
      throw new Error('Problem creating or updating record(s)')

    recordIds.forEach((recordId) =>
      console.log(`${isUpdate ? 'Updated' : 'Created'} ${tableNameProper} record, ID: `, recordId)
    )

    const firstRecord = result[0][tableNameProper]
    const allRecords = result.map((res) => res[tableNameProper])

    // Note: the structure of this output object is not ideal. We should really
    // just have a single array of results. However, this could break backwards
    // compatibility, hence separate fields for the "single" record and
    // "allRecords" (if there are more than one)
    const output = { [tableNameProper]: firstRecord }
    if (isMultiUpdate) output.allRecords = allRecords

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output,
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

const createOrUpdateTable = async (
  DBConnect: DBConnectType,
  db: DatabaseMethodsType,
  tableName: string,
  record: { [key: string]: object | string },
  tableNameOriginal: string
) => {
  const tableAndFields = await DBConnect.getDatabaseInfo(tableName)

  if (tableAndFields.length === 0) await db.createTable(tableName, tableNameOriginal)

  const fieldsToCreate = Object.entries(record)
    .filter(([fieldName]) => !tableAndFields.find(({ column_name }) => column_name === fieldName))
    .map(([fieldName, value]) => ({ fieldName, fieldType: getPostgresType(value) }))

  if (fieldsToCreate.length > 0) {
    if (config.allowedTablesNoColumns.includes(tableName))
      throw new Error(`Cannot add columns to table: ${tableName}`)
    await db.createFields(tableName, fieldsToCreate)
  }
}

export default modifyRecord

const getPostgresType = (value: any): string => {
  if (value instanceof Date) return 'timestamptz'
  if (Array.isArray(value)) {
    const elementType = value.length > 0 ? getPostgresType(value[0]) : 'varchar'
    return `${elementType}[]`
  }
  if (isDateString(value)) return 'date'
  if (isTimeString(value)) return 'time with timezone'
  if (isDateTimeString(value)) return 'timestamptz'
  if (value instanceof Object) return 'jsonb'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'double precision'
  return 'varchar'
}

const isDateString = (value: any) => {
  // This is the date format (ISO Date) stored in DatePicker responses
  if (typeof value !== 'string') return false
  const datePattern = /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1])$/
  return datePattern.test(value)
}

// We don't yet have plugins that store time or dateTime responses, so these
// won't really be used yet. Added for completeness.

const isTimeString = (value: any) => {
  if (typeof value !== 'string') return false
  const timePattern =
    /^(0\d|1\d|2\d):([0-5]\d):([0-5]\d)(\.\d{1,6})?([\+,-](0\d|1\d|2\d)(:([0-5]\d))?)?$/
  return timePattern.test(value)
}

const isDateTimeString = (value: any) => {
  if (typeof value !== 'string') return false
  const dateTimePattern =
    /^\d{4}-(0\d|1[0-2])-([0-2]\d|3[0-1]) (0\d|1\d|2\d):([0-5]\d):([0-5]\d)(\.\d{1,6})?([\+,-](0\d|1\d|2\d)(:([0-5]\d))?)?$/
  return dateTimePattern.test(value)
}
