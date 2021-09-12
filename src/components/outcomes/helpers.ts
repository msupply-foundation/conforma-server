import DBConnect from '../databaseConnect'
import { getTokenData, extractJWTfromHeader } from '../permissions/loginHelpers'
import { queryLinkedApplications } from './gqlDynamicQueries'
import { objectKeysToCamelCase } from '../utilityFunctions'
import evaluateExpression from '@openmsupply/expression-evaluator'
import fetch from 'node-fetch'
import { plural } from 'pluralize'
import { snakeCase, camelCase, startCase } from 'lodash'
import {
  ColumnDefinitionMasterList,
  ColumnDisplayDefinitions,
  DisplayDefinition,
  OutcomesDetailResponse,
  OutcomesTableResponse,
} from './types'
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

type ColumnDetailOutput = {
  columnDefinitionMasterList: ColumnDefinitionMasterList
  fieldNames: string[]
}
export const buildAllColumnDefinitions = async (
  permissionNames: string[],
  tableName: string,
  type: 'TABLE' | 'DETAIL'
): Promise<ColumnDetailOutput> => {
  // Look up allowed Outcome displays
  const outcomeTables = await DBConnect.getAllTableNames()
  if (!outcomeTables.includes(tableName)) throw new Error('Invalid table name')

  const outcomes = (await DBConnect.getAllowedOutcomeDisplays(permissionNames, tableName))
    .map((outcome) => objectKeysToCamelCase(outcome))
    .sort((a, b) => b.conflictPriority - a.conflictPriority) as OutcomeDisplay[]

  if (outcomes.length === 0) throw new Error(`No outcomes available for table "${tableName}"`)

  // Get all Fields on Outcome table (schema query)
  const fields: { name: string; dataType: string }[] = (
    await DBConnect.getOutcomeTableColumns(tableName)
  ).map(({ name, dataType }) => ({
    name: camelCase(name),
    dataType,
  }))
  const fieldNames = fields.map((field) => field.name)
  const fieldDataTypes = fields.reduce((dataTypeIndex: { [key: string]: string }, field) => {
    dataTypeIndex[field.name] = field.dataType
    return dataTypeIndex
  }, {})

  // Get all returning column names (include/exclude + custom columns)
  const columnsToReturn: string[] = buildColumnList(outcomes, fieldNames, type)

  // Get all associated display column_definition records
  const customDisplayDefinitions = await buildColumnDisplayDefinitions(tableName, columnsToReturn)

  // Build complete column definition list from the above
  const fieldNameSet = new Set(fieldNames)
  const columnDefinitionMasterList = columnsToReturn.map((column) => ({
    columnName: column,
    isBasicField: fieldNameSet.has(column),
    dataType: fieldDataTypes[column],
    columnDefinition: customDisplayDefinitions[column],
  }))

  return { columnDefinitionMasterList, fieldNames }
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

export const constructTableResponse = async (
  columnDefinitionMasterList: ColumnDefinitionMasterList,
  fetchedRecords: { id: number; [key: string]: any }[],
  totalCount: number
): Promise<OutcomesTableResponse> => {
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
  //  - for columns that need evaluation, we put all the Promises into an array
  //    (evaluationPromiseArray) so they can all be run asynchronously in
  //    parallel. We also need to keep track of where they belong in the main
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
            objects: { ...record, thisField: record[columnName] },
            // pgConnection: DBConnect, probably don't want to allow SQL
            APIfetch: fetch,
            // TO-DO: Need to pass Auth headers to evaluator API calls
            graphQLConnection: { fetch, endpoint: graphQLEndpoint },
          })
        )
      }
      evaluationIndexArray.push({ row: rowIndex, col: colIndex })
      return 'Awaiting promise...'
    })
    return { id: record.id, rowValues: thisRow, rowValuesObject: {} }
  })

  const resolvedValues = await Promise.all(evaluationPromiseArray)

  // Replace evaluated values in table structure
  resolvedValues.forEach((value, index) => {
    const { row, col } = evaluationIndexArray[index]
    tableRows[row].rowValues[col] = value
  })

  // Also provide a version of the row entity in Object form, just because
  tableRows.forEach((row: any) => {
    const rowValuesObject: { [key: string]: any } = {}
    columnDefinitionMasterList.forEach(
      ({ columnName }, index) => (rowValuesObject[columnName] = row.rowValues[index])
    )
    row.rowValuesObject = rowValuesObject
  })

  return { headerRow, tableRows, totalCount }
}

export const constructDetailsResponse = async (
  columnDefinitionMasterList: ColumnDefinitionMasterList,
  fetchedRecord: { id: number; [key: string]: any },
  linkedApplications: any
): Promise<OutcomesDetailResponse> => {
  const id = fetchedRecord.id
  const columns = columnDefinitionMasterList.map(({ columnName }) => columnName)

  // Build display defintions object
  const displayDefinitions: { [key: string]: DisplayDefinition } =
    columnDefinitionMasterList.reduce(
      (
        displayDef: { [key: string]: DisplayDefinition },
        { columnName, isBasicField, dataType, columnDefinition = {} }
      ) => {
        const { title, elementTypePluginCode, additionalFormatting } = columnDefinition
        displayDef[columnName] = {
          title: title ?? startCase(columnName),
          isBasicField,
          dataType,
          formatting: {
            elementTypePluginCode: elementTypePluginCode || undefined,
            ...additionalFormatting,
          },
        }
        return displayDef
      },
      {}
    )

  // Build item, keeping unresolved Promises in separate array (as above)
  const evaluationPromiseArray: Promise<any>[] = []
  const evaluationFieldArray: string[] = []
  const item = columnDefinitionMasterList.reduce(
    (obj: { [key: string]: any }, { columnName, isBasicField, columnDefinition }, index) => {
      if (isBasicField) obj[columnName] = fetchedRecord[columnName]
      else {
        evaluationPromiseArray.push(
          evaluateExpression(columnDefinition?.valueExpression ?? {}, {
            objects: { ...fetchedRecord, thisField: fetchedRecord[columnName] },
            // pgConnection: DBConnect, probably don't want to allow SQL
            APIfetch: fetch,
            // TO-DO: Need to pass Auth headers to evaluator API calls
            graphQLConnection: { fetch, endpoint: graphQLEndpoint },
          })
        )
        obj[columnName] = 'Awaiting promise...'
        evaluationFieldArray.push(columnName)
      }
      return obj
    },
    {}
  )
  const resolvedValues = await Promise.all(evaluationPromiseArray)

  // Replace evaluated values in item
  resolvedValues.forEach((value, index) => {
    const field = evaluationFieldArray[index]
    item[field] = value
  })

  return { id, columns, displayDefinitions, item, linkedApplications }
}
