import databaseConnect from '../databaseConnect'
import getDatabaseInfo from './getDatabaseInfo'
import { DatabaseTable, ExportAndImportOptions, ObjectRecords } from './types'
import pluralize from 'pluralize'
import { filterByIncludeAndExclude, noQuoteKeyStringify } from './helpers'

const getRecordsAsObject = async ({
  filters,
  includeTables,
  excludeTables,
}: ExportAndImportOptions) => {
  const databaseTables = (await getDatabaseInfo()).filter(({ isView }) => !isView)

  const tablesToExport = filterByIncludeAndExclude(includeTables, excludeTables, databaseTables)

  const filteredRecords: ObjectRecords = {}
  const records: ObjectRecords = {}

  for (const table of tablesToExport) {
    const { tableName } = table
    const baseFilter = filters?.[tableName]
    const filteredReferences = getFilteredReferences(table, filteredRecords, baseFilter)

    const { gql, getter, hasFilter } = constructGqlAndGetter(table, filteredReferences, baseFilter)
    const result = await databaseConnect.gqlQuery(gql)
    const rows = getter(result)
    records[tableName] = rows
    if (hasFilter) filteredRecords[tableName] = rows
  }

  return records
}

const getFilteredReferences = (
  { referenceTables, columns }: DatabaseTable,
  previousFilteredRecords: ObjectRecords,
  baseFilter: object | undefined
) => {
  if (referenceTables.length === 0) return {}

  // i.e. { section: {id: {in: [10, 20]}}}
  const filters: {
    [referenceColumnName: string]: { in: any[] }
  } = {}

  columns.forEach(
    ({
      isReference,
      isNullable,
      reference: { tableName: referencedTableName, columnName: referencedColumnName },
      columnName,
    }) => {
      if (!isReference) return
      // If the column is nullable and there is already a base filter defined
      // (in options) for this table, then don't make additional filters based
      // on references, otherwise it can filter out to much (particularly for
      // template export)
      if (baseFilter && isNullable) return
      const filteredRecords = previousFilteredRecords[referencedTableName]
      if (!filteredRecords) return

      const inValues = filteredRecords.map((filteredRecord) => filteredRecord[referencedColumnName])

      filters[columnName] = { in: inValues }
    }
  )

  return filters
}

const constructGqlAndGetter = (
  { tableName, columns }: DatabaseTable,
  filteredReferences: object,
  baseFilter: object | undefined
) => {
  const filter = { ...baseFilter, ...filteredReferences }
  const hasFilter = Object.keys(filter).length > 0

  const filterString = !hasFilter ? '' : `(filter: ${noQuoteKeyStringify(filter)})`

  const pluralTableName = pluralize(tableName)
  const gql = `query ${pluralTableName} { 
    ${pluralTableName}${filterString} {
        nodes {
            ${columns.map(({ columnName }) => columnName).join(' ')}
        }
    }
  }`

  const getter = (gqlResult: any) => gqlResult[pluralTableName].nodes

  return { gql, getter, hasFilter }
}

export default getRecordsAsObject
