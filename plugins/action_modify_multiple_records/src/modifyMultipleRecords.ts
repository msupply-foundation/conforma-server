import { get as extractProperty } from 'lodash'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginType } from '../../types'
import { action as modifyRecord } from '../../action_modify_record/src'

// This action just calls the existing "modifyRecord" action on each record in
// the "records" array supplied here, with optional keyMap if needed

const modifyMultipleRecords: ActionPluginType = async ({
  parameters,
  applicationData,
  DBConnect,
}) => {
  const {
    tableName,
    matchField,
    matchValue,
    shouldCreateJoinTable,
    data,
    records,
    keyMap,
    delete: deleteRecord = false,
    ...otherCommonFields
  } = parameters

  // Main parameters can be provided to each individual record, but most
  // parameters would usually be the same for all of them, in which case common
  // parameter values can be provided at the top-level. Per-record parameters
  // will take precedence in the case that both are provided.
  const multipleRecords = records.map((record: { [key: string]: any }) => {
    const newRecord = keyMap ? constructMappedRecords(record, keyMap) : { ...record }
    newRecord.tableName = record.tableName ?? tableName
    newRecord.matchField = record.matchField ?? matchField
    newRecord.matchValue = record.matchValue ?? matchValue
    newRecord.shouldCreateJoinTable = record.shouldCreateJoinTable ?? shouldCreateJoinTable ?? true
    newRecord.data = { ...data, ...record.data }

    // If `delete` is set, we assume we want to delete all records in the
    // `records` array, so we set the record's matchValue to its own matchField
    // (or id by default) value
    if (deleteRecord && newRecord.matchValue === undefined) {
      const matchFieldName = newRecord.matchField || 'id'
      newRecord.matchValue = newRecord[matchFieldName]
    }

    return { ...otherCommonFields, ...newRecord, delete: deleteRecord }
  })

  let status = ActionQueueStatus.Success
  const errors: string[] = []
  const results: ActionPluginOutput[] = []

  for (const record of multipleRecords) {
    const result = await modifyRecord({ parameters: record, applicationData, DBConnect })

    if (result.status === ActionQueueStatus.Fail) {
      status = ActionQueueStatus.Fail
      errors.push(result.error_log)
    }
    results.push(result)
  }

  return { output: { records: results }, status, error_log: errors.join(', ') }
}

// This allows us to remap the property names of the incoming objects to those
// required by the destination data table. For a single record, we can already
// map individual fields, but we can't access individual items in an array of
// records.
const constructMappedRecords = (
  record: { [key: string]: any },
  keyMap: { [key: string]: string }
) => {
  const newRecord: { [key: string]: any } = {}
  Object.entries(keyMap).forEach(([key, path]) => {
    const mappedValue = extractProperty(record, path, '__MAPPING_NOT_FOUND__')
    console.log(path, mappedValue)
    if (mappedValue !== '__MAPPING_NOT_FOUND__') newRecord[key] = mappedValue
  })

  return newRecord
}

export default modifyMultipleRecords
