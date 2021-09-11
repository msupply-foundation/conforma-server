import DBConnect from '../databaseConnect'
import { getTokenData, extractJWTfromHeader } from '../permissions/loginHelpers'
import { objectKeysToCamelCase } from '../utilityFunctions'
import evaluateExpression from '@openmsupply/expression-evaluator'
import fetch from 'node-fetch'
import { plural } from 'pluralize'
import { snakeCase, startCase } from 'lodash'
import { ColumnDefinitionMasterList, ColumnDisplayDefinitions, OutcomesTableResult } from './types'
import { OutcomeDisplay, OutcomeDisplayColumnDefinition } from '../../generated/graphql'
import config from '../../config'

// CONSTANTS
const REST_OF_OUTCOME_FIELDS = '...REST'
const graphQLEndpoint = config.graphQLendpoint

export const getPermissionNamesFromJWT = async (request: any): Promise<string[]> => {
  const { userId, orgId } = await getTokenData(extractJWTfromHeader(request))
  return await (
    await DBConnect.getUserOrgPermissionNames(userId, orgId)
  ).map((result) => result.permissionName)
}

export const buildColumnList = (
  outcomes: OutcomeDisplay[],
  fieldNames: string[],
  type: 'TABLE' | 'DETAIL'
): string[] => {
  const includeColumns: string[] = []
  const excludeColumns: string[] = []
  const includeField = type === 'TABLE' ? 'tableViewIncludeColumns' : 'detailViewIncludeColumns'
  const excludeField = type === 'TABLE' ? 'tableViewExcludeColumns' : 'detailViewExcludeColumns'
  outcomes.forEach((outcome) => {
    if (outcome[includeField] === null) includeColumns.push(...fieldNames)
    else includeColumns.push(...(outcome[includeField] as string[]))
    outcome[excludeField] !== null && excludeColumns.push(...(outcome[excludeField] as string[]))
  })
  const includeSet = new Set(includeColumns)
  // '...REST' allows us to include all fields from original outcome table, even
  // if we've added some custom columns to "include" list
  if (includeSet.has(REST_OF_OUTCOME_FIELDS)) {
    includeSet.delete(REST_OF_OUTCOME_FIELDS)
    fieldNames.forEach((name) => includeSet.add(name))
  }
  const excludeSet = new Set(excludeColumns)
  return [...includeSet].filter((x) => !excludeSet.has(x))
}

export const buildColumnDisplayDefinitions = async (
  tableName: string,
  columns: string[]
): Promise<ColumnDisplayDefinitions> => {
  const columnDefinitionArray = await DBConnect.getOutcomeColumnDefinitions(tableName, columns)
  const columnDisplayDefinitions: ColumnDisplayDefinitions = {}
  columnDefinitionArray.forEach((item) => {
    columnDisplayDefinitions[item.column_match] = objectKeysToCamelCase(
      item
    ) as OutcomeDisplayColumnDefinition
  })
  return columnDisplayDefinitions
}

export const buildColumnDefinitionList = (
  columns: string[],
  fieldNames: Set<string>,
  fieldDataTypes: { [key: string]: string },
  customDisplayDefinitions: ColumnDisplayDefinitions
): ColumnDefinitionMasterList =>
  columns.map((column) => ({
    columnName: column,
    isBasicField: fieldNames.has(column),
    dataType: fieldDataTypes[column],
    columnDefinition: customDisplayDefinitions[column],
  }))

export const queryOutcomeTable = async (
  tableName: string,
  fieldNames: string[],
  first: number,
  offset: number,
  orderBy: string,
  ascending: boolean,
  authHeaders: string
) => {
  const tableNamePlural = plural(tableName)
  const graphQLquery = `query getOutcomeRecords { ${tableNamePlural}(first: ${first}, offset: ${offset}, orderBy: ${snakeCase(
    orderBy
  ).toUpperCase()}_${ascending ? 'ASC' : 'DESC'}) { nodes { ${fieldNames.join(
    ', '
  )} }, totalCount}}`

  const queryResult = await DBConnect.gqlQuery(graphQLquery, {}, authHeaders)
  const fetchedRecords = queryResult?.[tableNamePlural]?.nodes
  const totalCount = queryResult?.[tableNamePlural]?.totalCount
  return { fetchedRecords, totalCount }
}

export const constructResponse = async (
  columnDefinitionMasterList: ColumnDefinitionMasterList,
  fetchedRecords: { id: number; [key: string]: any }[],
  totalCount: number
): Promise<OutcomesTableResult> => {
  // Build table headers, which also carry any additional display/format
  // definitions for each column
  const headerRow = columnDefinitionMasterList.map(
    ({ columnName, isBasicField, dataType, columnDefinition = {} }) => {
      const { title, elementTypePluginCode, additionalFormatting } = columnDefinition
      return {
        columnName,
        title: title ?? startCase(columnName),
        isBasicField,
        dataType,
        formatting: {
          elementTypePluginCode: elementTypePluginCode || undefined,
          ...additionalFormatting,
        },
      }
    }
  )

  // Construct table rows by iterating over outcome records
  //  - for columns that need evaluation, we put all these into an array
  //    (evaluationPromiseArray) so they can all be run asynchronously in
  //    parallel. We also need to keep track of where they go in the main
  //    structure so we can replace them once all Promises are resolved
  //    (evaluationIndexArray).
  const evaluationPromiseArray: Promise<any>[] = []
  const evaluationIndexArray: { row: number; col: number }[] = []
  const tableRows = fetchedRecords.map((record, rowIndex) => {
    const thisRow = columnDefinitionMasterList.map((cell, colIndex) => {
      const { columnName, isBasicField, columnDefinition } = cell
      if (isBasicField) return record[columnName]
      else {
        evaluationPromiseArray.push(
          evaluateExpression(columnDefinition?.valueExpression ?? {}, {
            objects: { ...record, thisRecord: record[columnName] },
            // pgConnection: DBConnect, probably don't want to allow Postgres
            APIfetch: fetch,
            // TO-DO: Need to pass Auth headers to evaluator API calls
            graphQLConnection: { fetch, endpoint: graphQLEndpoint },
          })
        )
      }
      evaluationIndexArray.push({ row: rowIndex, col: colIndex })
      return 'Awaiting promise...'
    })
    return { id: record.id, rowValues: thisRow, rowAsObject: {} }
  })

  const resolvedValues = await Promise.all(evaluationPromiseArray)

  // Replace evaluated values in structure
  resolvedValues.forEach((value, index) => {
    const { row, col } = evaluationIndexArray[index]
    tableRows[row].rowValues[col] = value
  })

  // Also provide a version of the row entity in Object form, just because
  tableRows.forEach((row: any) => {
    const rowAsObject: any = {}
    columnDefinitionMasterList.forEach(
      ({ columnName }, index) => (rowAsObject[columnName] = row.rowValues[index])
    )
    row.rowAsObject = rowAsObject
  })

  return { headerRow, tableRows, totalCount }
}
