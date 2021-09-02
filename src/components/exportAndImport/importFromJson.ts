import { camelCase } from 'lodash'
import databaseConnect from '../databaseConnect'
import getDatabaseInfo from './getDatabaseInfo'
import { filterByIncludeAndExclude } from './helpers'
import { singular } from 'pluralize'
import {
  DatabaseColumn,
  DatabaseTable,
  ExportAndImportOptions,
  InsertedRecords,
  ObjectRecord,
  ObjectRecords,
} from './types'

const insertFromObject = async (
  records: ObjectRecords,
  { includeTables, excludeTables, skipTableOnInsertFail = [] }: ExportAndImportOptions,
  preserveIds: boolean = false
) => {
  const databaseTables = (await getDatabaseInfo()).filter(({ isView }) => !isView)

  const tablesToImport = filterByIncludeAndExclude(includeTables, excludeTables, databaseTables)
  const insertedRecords: InsertedRecords = {}

  for (let table of tablesToImport) {
    const { tableName } = table
    const recordsForTable = records[tableName]
    if (!recordsForTable || recordsForTable.length === 0) continue

    for (let record of recordsForTable) {
      const { insertQuery, getRecordQuery, insertGetter, getRecordGetter, variables } =
        constructInsertAndGetter(record, table, insertedRecords, preserveIds)
      let result = {}
      let row = {}
      try {
        result = await databaseConnect.gqlQuery(insertQuery, variables)
        row = insertGetter(result)
      } catch (e) {
        // If insert failed and table is in skipTableOnInsertFail, this is likely due to unique constraint (i.e. permissionName.name or filter.code)
        // in this case record should be skipped but we still want to get id for existing record so that we can link related records (i.e templatePermission)
        if (!skipTableOnInsertFail.includes(tableName)) throw e
        if (!getRecordQuery)
          throw new Error(
            `insert query failed but no unique field found to construct getter query, insert query was: ${insertQuery}`
          )
        result = await databaseConnect.gqlQuery(getRecordQuery, variables)
        row = getRecordGetter(result)
      }

      if (!insertedRecords[tableName]) insertedRecords[tableName] = []
      insertedRecords[tableName].push({ old: record, new: row })
    }
  }

  return insertedRecords
}

const constructInsertAndGetter = (
  record: ObjectRecord,
  { tableName, columns }: DatabaseTable,
  insertedRecords: InsertedRecords,
  preserveIds: boolean
) => {
  const foreignKeyReplacements = getForeignKeyReplacements(record, columns, insertedRecords)
  const insertableValues: ObjectRecord = {}
  const values = { ...record, ...foreignKeyReplacements }
  let uniqueField: string | undefined

  columns.forEach(({ isPrimary, isGenerated, isUnique, columnName }) => {
    if (!preserveIds && isPrimary) return
    if (isGenerated) return
    if (values[columnName] === undefined) return
    if (isUnique) uniqueField = camelCase(columnName)
    insertableValues[columnName] = values[columnName]
  })

  // Postgraphile will make all plural table names singular for mutations
  const singularTableName = singular(tableName)
  const insertMutationName = camelCase(`create ${singularTableName}`)
  const getRecordQueryName = camelCase(`${singularTableName} by ${uniqueField}`)
  const { keyValues, variables, variableDeclarations } = getInsertKeyValues(
    insertableValues,
    columns
  )

  const resultFields = ` ${columns.map(({ columnName }) => columnName).join(' ')}`

  const insertQuery = `mutation ${insertMutationName} ${variableDeclarations} {
        ${insertMutationName} (
            input: {
                ${singularTableName}: {
                    ${keyValues}
                }
            }
        ) { ${singularTableName} { ${resultFields} } }
    }`

  const getRecordQuery =
    uniqueField &&
    `query ${getRecordQueryName} { 
      ${getRecordQueryName}(${uniqueField}: "${record[uniqueField]}") { ${resultFields} }
  }`

  const insertGetter = (gqlResult: any) => gqlResult[insertMutationName][singularTableName]
  const getRecordGetter = (gqlResult: any) => gqlResult[getRecordQueryName]
  return { insertQuery, getRecordQuery, insertGetter, getRecordGetter, variables }
}

const getForeignKeyReplacements = (
  record: ObjectRecord,
  columns: DatabaseColumn[],
  insertedRecords: InsertedRecords
) => {
  const foreignKeyReplacements: ObjectRecord = {}
  columns
    .filter(({ isReference }) => isReference)
    .forEach(
      ({
        columnName,
        reference: { columnName: referenceColumnName, tableName: referenceTableName },
      }) => {
        const referenceValue = findReferenceValues(
          record[columnName],
          insertedRecords,
          referenceColumnName,
          referenceTableName
        )
        if (referenceValue) foreignKeyReplacements[columnName] = referenceValue
      }
    )
  return foreignKeyReplacements
}

const findReferenceValues = (
  valueToFindAndReplace: string,
  insertedRecords: InsertedRecords,
  referenceColumnName: string,
  referenceTableName: string
) => {
  if (!valueToFindAndReplace) return null
  const referencedTable = insertedRecords[referenceTableName]
  if (!referencedTable || referencedTable.length === 0) return null

  const referencedRecord = referencedTable.find(
    ({ old }) => old[referenceColumnName] === valueToFindAndReplace
  )
  if (!referencedRecord) return null
  return referencedRecord.new[referenceColumnName]
}
type JsonVariables = { [variableName: string]: string }

const getInsertKeyValues = (values: ObjectRecord, columns: DatabaseColumn[]) => {
  const jsonVariables: JsonVariables = {}

  const keyValues = Object.entries(values)
    .map(([columnName, value]) => {
      let gqlValue = JSON.stringify(value)

      const column = columns.find((column) => columnName === column.columnName)
      if (column) {
        // Make sure enum values are not quoted
        if (column.isEnum) gqlValue = value
        // Make sure enum values are not quoted in an array
        if (column.isEnumArray) gqlValue = gqlValue.replace(/"/g, '')
        // Add quotes around object
        if (column.isJson && value instanceof Object) {
          const variableName = `$${columnName}`
          jsonVariables[columnName] = value

          gqlValue = variableName
        }
      }

      return `${columnName}: ${gqlValue}`
    })
    .join(',')

  const variableDeclarations = Object.keys(jsonVariables).map(
    (variableName) => `$${variableName}: JSON!`
  )

  return {
    keyValues,
    variables: jsonVariables,
    variableDeclarations:
      variableDeclarations.length === 0 ? '' : `(${variableDeclarations.join(',')})`,
  }
}

export default insertFromObject
