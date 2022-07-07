import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginType } from '../../types'
import databaseMethods, { DatabaseMethodsType } from './databaseMethods'
import { DBConnectType } from '../../../src/components/databaseConnect'
import { mapValues, get, snakeCase } from 'lodash'
import { objectKeysToSnakeCase } from '../../../src/components/utilityFunctions'
import { singular } from 'pluralize'

// This will be prepended to NEW table created if not already present
export const DATA_TABLE_PREFIX = 'data_table_'

// These are the only tables in the system that we allow to be mutated with this
// plugin. All other names will have "data_table_" prepended.
const ALLOWED_TABLE_NAMES = ['user', 'organisation', 'application', 'file']

const modifyRecord: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const {
    tableName,
    matchField,
    matchValue,
    shouldCreateJoinTable = true,
    data,
    records,
    keyMap, // Not used in here, but stops it from becoming a field name
    ...record
  } = parameters

  const tableNameProper = getValidTableName(tableName)

  const fieldToMatch = matchField ?? 'id'
  const valueToMatch = matchValue ?? record[fieldToMatch]
  const applicationId = applicationData?.applicationId || 0

  // If multiple records, run whole action on each one
  if (records) {
    const combinedOutput = await updateMultipleRecords({ parameters, applicationData, DBConnect })
    return combinedOutput
  }

  // Don't update fields with NULL
  for (const key in record) {
    if (record[key] === null) delete record[key]
  }

  // Build full record
  const fullRecord = objectKeysToSnakeCase({
    ...record,
    ...mapValues(data, (property) => get(applicationData, property, null)),
  })

  try {
    await createOrUpdateTable(DBConnect, db, tableNameProper, fullRecord, tableName)

    let recordId = await db.getRecordId(tableNameProper, fieldToMatch, valueToMatch)
    const isUpdate = recordId !== 0

    let result: any = {}
    if (isUpdate) {
      // UPDATE
      console.log(`Updating ${tableNameProper} record: ${JSON.stringify(fullRecord, null, 2)}`)
      result = await db.updateRecord(tableNameProper, recordId, fullRecord)
    } else {
      // CREATE NEW
      console.log(`Creating ${tableNameProper} record: ${JSON.stringify(fullRecord, null, 2)}`)
      result = await db.createRecord(tableNameProper, fullRecord)
      recordId = result.recordId
    }

    if (shouldCreateJoinTable)
      await db.createJoinTableAndRecord(tableNameProper, applicationId, recordId)

    if (!result.success) throw new Error('Problem creating or updating record')

    console.log(`${isUpdate ? 'Updated' : 'Created'} ${tableNameProper} record, ID: `, recordId)
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { [tableNameProper]: result[tableNameProper] },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

// When we have multiple records, we recursively call "modifyRecord" on each
// one, and collect all outputs
const updateMultipleRecords: ActionPluginType = async ({
  parameters,
  applicationData,
  DBConnect,
}) => {
  let status = ActionQueueStatus.Success
  const errors: string[] = []
  const {
    tableName,
    matchField,
    matchValue,
    shouldCreateJoinTable = true,
    data,
    records,
    keyMap,
    ...otherFields
  } = parameters

  const results: ActionPluginOutput[] = []

  for (const record of keyMap ? constructMappedRecords(records, keyMap, otherFields) : records) {
    const result = await modifyRecord({
      parameters: { tableName, matchField, matchValue, shouldCreateJoinTable, data, ...record },
      applicationData,
      DBConnect,
    })
    if (result.status === ActionQueueStatus.Fail) {
      status = ActionQueueStatus.Fail
      errors.push(result.error_log)
    }
    results.push(result)
  }

  return { output: { records: results }, status, error_log: errors.join(', ') }
}

// This allows us to remap the property names of the incoming objects to those
// required by the desination data table. For a single record, we can already
// map individual fields, but we can't access individual items in an array of
// records
const constructMappedRecords = (
  records: { [key: string]: any }[],
  keyMap: { [key: string]: any },
  otherFields: { [key: string]: any }
) => {
  return records.map((record) => {
    const newRecord: { [key: string]: any } = {}
    Object.entries(keyMap).forEach(([key, value]) => {
      if (value in record) newRecord[key] = record?.[value]
      // Make sure the "standard" parameters get kept, if present in individual
      // records
      const { tableName, matchField, matchValue, data, shouldCreateJoinTable } = record
      if (tableName) newRecord.tableName = tableName
      if (matchField) newRecord.matchField = matchField
      if (matchValue) newRecord.matchValue = matchValue
      if (data) newRecord.data = data
      if (shouldCreateJoinTable) newRecord.shouldCreateJoinTable = shouldCreateJoinTable
    })
    return { ...newRecord, ...otherFields }
  })
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

  if (fieldsToCreate.length > 0) await db.createFields(tableName, fieldsToCreate)
}

export default modifyRecord

const getValidTableName = (inputName: string | undefined): string => {
  if (!inputName) throw new Error('Missing table name')
  if (ALLOWED_TABLE_NAMES.includes(inputName)) return inputName
  const tableName = snakeCase(singular(inputName))
  const namePattern = new RegExp(`^${DATA_TABLE_PREFIX}.+`)

  return namePattern.test(tableName) ? tableName : `${DATA_TABLE_PREFIX}${tableName}`
}

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
