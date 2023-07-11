import databaseConnect from '../databaseConnect'
import getDatabaseInfo from './getDatabaseInfo'
import { DatabaseTable, ExportAndImportOptions, ObjectRecords } from './types'
import pluralize from 'pluralize'
import { filterByIncludeAndExclude, noQuoteKeyStringify } from './helpers'
import { Template, TemplateStatus } from '../../generated/graphql'
import { DateTime } from 'luxon'

const getRecordsAsObject = async ({
  filters,
  includeTables,
  excludeTables,
  templates,
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
    records[tableName] = tableName === 'template' ? updateTemplateData(rows, templates) : rows
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
      // on references, otherwise it can filter out too much (particularly for
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

// Reset the version info for templates. Used when duplicating a NEW template
// version using a snapshot export/import. This intercepts the template records
// and sets the version data accordingly.
const updateTemplateData = (
  templates: Template[],
  templateOptions?: { resetVersion?: boolean; newCode?: string }
) => {
  if (templateOptions?.newCode) {
    // Change template code and erase version history
    return templates.map((template) => ({
      ...template,
      code: templateOptions.newCode,
      name: `New template based from: ${template.name}`,
      namePlural: null,
      status: TemplateStatus.Draft,
      versionHistory: [],
      parentVersionId: null,
      versionId: '*',
      versionComment: null,
    }))
  }

  if (templateOptions?.resetVersion)
    // Set version to "*" (editable) and update version history
    return templates.map((template) => ({
      ...template,
      status: TemplateStatus.Draft,
      versionHistory: [
        ...template.versionHistory,
        {
          comment: template.versionComment,
          timestamp: template.versionTimestamp,
          versionId: template.versionId,
          parentVersionId: template.parentVersionId,
        },
      ],
      parentVersionId: template.versionId,
      versionId: '*',
      versionComment: null,
      versionTimestamp: DateTime.now().toISO(),
    }))

  return templates
}

export default getRecordsAsObject
