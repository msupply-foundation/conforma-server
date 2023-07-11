import { camelCase, mapValues } from 'lodash'
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
import { customAlphabet } from 'nanoid'
import { DateTime } from 'luxon'
import { Template } from '../../generated/graphql'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 6)

type InsertFromObject = (
  records: ObjectRecords,
  options: ExportAndImportOptions,
  preserveIds?: boolean
) => Promise<InsertedRecords>

const insertFromObject: InsertFromObject = async (
  records,
  { includeTables, excludeTables, skipTableOnInsertFail = [], templates },
  preserveIds = false
) => {
  const databaseTables = (await getDatabaseInfo()).filter(({ isView }) => !isView)

  const tablesToImport = filterByIncludeAndExclude(includeTables, excludeTables, databaseTables)
  const insertedRecords: InsertedRecords = {}

  for (let table of tablesToImport) {
    const { tableName } = table
    const recordsForTable = records[tableName]
    if (!recordsForTable || recordsForTable.length === 0) continue

    // When importing a template, check that version doesn't already exist in
    // the system
    if (
      tableName === 'template' &&
      templates?.checkVersionOnImport &&
      recordsForTable.length === 1
    ) {
      const template = recordsForTable[0]

      // If template was exported using an earlier version schema, we need to
      // migrate it first
      if (!('versionId' in template)) {
        template.versionId = nanoid()
        template.versionComment = 'Migrated from previous version format'
        template.versionHistory = new Array(template.version).fill(0).map((_) => ({
          comment: null,
          timestamp: DateTime.fromISO(template.versionTimestamp),
          versionId: nanoid(),
          parentVersionId: null,
        }))
        template.version = null
      }

      const existingVersions = await databaseConnect.getTemplateVersionIDs(template.code)

      // Make sure unlocked "*" templates have unique versionId
      if (isTemplateUnlocked(template as Template)) {
        let suffix = 1
        while (existingVersions.includes(template.versionId)) {
          template.versionId = `*_${suffix++}`
        }
      }

      if (existingVersions.includes(template.versionId))
        throw new Error('Template version already exists in the system')
    }

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
        else foreignKeyReplacements[columnName] = null
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
type JsonVariables = { [variableName: string]: { value: JSON; type: 'JSON!' | '[JSON!]' } }

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
        if ((column.isJson || column.isJsonArray) && value instanceof Object) {
          const variableName = `$${columnName}`
          const type = column.isJson ? 'JSON!' : '[JSON!]'
          jsonVariables[columnName] = { value, type }

          gqlValue = variableName
        }
      }

      return `${columnName}: ${gqlValue}`
    })
    .join(',')

  const variableDeclarations = Object.entries(jsonVariables).map(
    ([variableName, { type }]) => `$${variableName}: ${type}`
  )

  return {
    keyValues,
    variables: mapValues(jsonVariables, ({ value }) => value),
    variableDeclarations:
      variableDeclarations.length === 0 ? '' : `(${variableDeclarations.join(',')})`,
  }
}

// Checks if template version starts with "*" character (i.e. template can be
// modified)
const isTemplateUnlocked = (template: Template) => /\*/.test(template.versionId)

export default insertFromObject
