import { camelCase } from 'lodash'
import databaseConnect from '../databaseConnect'
import getDatabaseInfo from './getDatabaseInfo'
import { filterByIncludeAndExclude } from './helpers'
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
  { includeTables, excludeTables, tablesToUpdateOnInsertFail = [] }: ExportAndImportOptions,
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
      const { insertQuery, updateQuery, insertGetter, updateGetter, variables } =
        constructInsertAndGetter(record, table, insertedRecords, preserveIds)
      let result = {}
      let row = {}
      try {
        result = await databaseConnect.gqlQuery(insertQuery, variables)
        row = insertGetter(result)
      } catch (e) {
        if (!tablesToUpdateOnInsertFail.includes(tableName)) throw e
        result = await databaseConnect.gqlQuery(updateQuery, variables)
        row = updateGetter(result)
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

  columns.forEach(({ isPrimary, isGenerated, columnName }) => {
    if (!preserveIds && isPrimary) return
    if (isGenerated) return
    insertableValues[columnName] = values[columnName]
  })

  const insertMutationName = camelCase(`create ${tableName}`)
  const updateMutationName = camelCase(`update ${tableName}`)
  const { keyValues, variables, variableDeclarations } = getInsertKeyValues(
    insertableValues,
    columns
  )

  const resultQuery = `${tableName} { ${columns.map(({ columnName }) => columnName).join(' ')} }`

  const insertQuery = `mutation ${insertMutationName} ${variableDeclarations} {
        ${insertMutationName} (
            input: {
                ${tableName}: {
                    ${keyValues}
                }
            }
        ) { ${resultQuery} }
    }`

  const updateQuery = `mutation ${updateMutationName} ${variableDeclarations} {
      ${updateMutationName} (
          input: {
              patch: {
                  ${keyValues}
              },
              id: ${record.id}
          }
      ) { ${resultQuery} }
  }`

  const insertGetter = (gqlResult: any) => gqlResult[insertMutationName][tableName]
  const updateGetter = (gqlResult: any) => gqlResult[updateMutationName][tableName]
  return { insertQuery, updateQuery, insertGetter, updateGetter, variables }
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
