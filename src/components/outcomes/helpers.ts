import DBConnect from '../databaseConnect'
import { getTokenData, extractJWTfromHeader } from '../permissions/loginHelpers'
import { objectKeysToCamelCase } from '../utilityFunctions'
import evaluateExpression from '@openmsupply/expression-evaluator'
import fetch from 'node-fetch'
import { camelCase, startCase } from 'lodash'
import {
  ColumnDefinition,
  ColumnDefinitionMasterList,
  ColumnDetailOutput,
  ColumnDisplayDefinitions,
  DetailsHeader,
  DisplayDefinition,
  LinkedApplication,
  OutcomesDetailResponse,
  OutcomesTableResponse,
} from './types'
import { OutcomeDisplay, OutcomeDisplayColumnDefinition } from '../../generated/graphql'
import config from '../../config'

// CONSTANTS
const REST_OF_OUTCOME_FIELDS = '...'
const graphQLEndpoint = config.graphQLendpoint

export const getPermissionNamesFromJWT = async (request: any): Promise<string[]> => {
  const { userId, orgId } = await getTokenData(extractJWTfromHeader(request))
  return await (
    await DBConnect.getUserOrgPermissionNames(userId, orgId)
  ).map((result) => result.permissionName)
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
    .sort((a, b) => b.priority - a.priority) as OutcomeDisplay[]

  if (outcomes.length === 0) throw new Error(`No outcomes available for table "${tableName}"`)

  // Only for details view
  const headerColumnName = outcomes[0]?.detailViewHeaderColumn ?? ''
  const showLinkedApplications = outcomes[0].showLinkedApplications

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
  const customDisplayDefinitions = await buildColumnDisplayDefinitions(tableName, [
    ...columnsToReturn,
    headerColumnName,
  ])

  // Build complete column definition list from the above
  const fieldNameSet = new Set(fieldNames)
  const columnDefinitionMasterList = columnsToReturn.map((column) => ({
    columnName: column,
    isBasicField: fieldNameSet.has(column),
    dataType: fieldDataTypes[column],
    columnDefinition: customDisplayDefinitions[column],
  }))

  // Build header definition (only for Detail view)
  const headerDefinition =
    type === 'DETAIL'
      ? {
          columnName: headerColumnName,
          isBasicField: fieldNameSet.has(headerColumnName),
          dataType: fieldDataTypes[headerColumnName],
          columnDefinition: customDisplayDefinitions[headerColumnName],
        }
      : undefined

  return { columnDefinitionMasterList, fieldNames, headerDefinition, showLinkedApplications }
}

const buildColumnList = (
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
  // Convert to Sets to remove duplicate column names from multiple outcomes and
  // expand "..." to all fields (so we don't have to enter the full field list
  // in "includeColumns" when also adding a "custom" field)
  const includeSet = new Set(
    includeColumns.map((col) => (col === REST_OF_OUTCOME_FIELDS ? fieldNames : col)).flat()
  )
  const excludeSet = new Set(excludeColumns)
  return [...includeSet].filter((x) => !excludeSet.has(x))
}

const buildColumnDisplayDefinitions = async (
  tableName: string,
  columns: string[]
): Promise<ColumnDisplayDefinitions> => {
  const columnDefinitionArray = await DBConnect.getOutcomeColumnDefinitions(tableName, columns)
  const columnDisplayDefinitions: ColumnDisplayDefinitions = {}
  columnDefinitionArray.forEach((item) => {
    columnDisplayDefinitions[item.column_name] = objectKeysToCamelCase(
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
      const { title, elementTypePluginCode, elementParameters, additionalFormatting } =
        columnDefinition
      return {
        columnName,
        title: title ?? startCase(columnName),
        isBasicField,
        dataType,
        formatting: {
          elementTypePluginCode: elementTypePluginCode || undefined,
          elementParameters: elementParameters || undefined,
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
      if (!columnDefinition?.valueExpression) return 'Field not defined'
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
  headerDefinition: ColumnDefinition,
  fetchedRecord: { id: number; [key: string]: any },
  linkedApplications: LinkedApplication[] | undefined
): Promise<OutcomesDetailResponse> => {
  const id = fetchedRecord.id
  const columns = columnDefinitionMasterList.map(({ columnName }) => columnName)

  // Build display definitions object
  const displayDefinitions: { [key: string]: DisplayDefinition } =
    columnDefinitionMasterList.reduce(
      (
        displayDef: { [key: string]: DisplayDefinition },
        { columnName, isBasicField, dataType, columnDefinition = {} }
      ) => {
        const { title, elementTypePluginCode, elementParameters, additionalFormatting } =
          columnDefinition
        displayDef[columnName] = {
          title: title ?? startCase(columnName),
          isBasicField,
          dataType,
          formatting: {
            elementTypePluginCode: elementTypePluginCode || undefined,
            elementParameters: elementParameters || undefined,
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
    (obj: { [key: string]: any }, { columnName, isBasicField, columnDefinition }) => {
      if (isBasicField) obj[columnName] = fetchedRecord[columnName]
      else if (!columnDefinition?.valueExpression) obj[columnName] = 'Field not defined'
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
  // Build header
  const header: DetailsHeader = {
    value: null,
    columnName: headerDefinition.columnName,
    isBasicField: headerDefinition.isBasicField,
    dataType: headerDefinition?.dataType,
    formatting: {
      elementTypePluginCode: headerDefinition?.columnDefinition?.elementTypePluginCode || undefined,
      elementParameters: headerDefinition?.columnDefinition?.elementParameters || undefined,
      ...headerDefinition?.columnDefinition?.additionalFormatting,
    },
  }
  if (headerDefinition.isBasicField) header.value = fetchedRecord[headerDefinition.columnName]
  if (!headerDefinition?.columnDefinition?.valueExpression) header.value = 'Field not defined'
  else {
    evaluationPromiseArray.push(
      evaluateExpression(headerDefinition?.columnDefinition?.valueExpression ?? {}, {
        objects: { ...fetchedRecord, thisField: fetchedRecord[headerDefinition.columnName] },
        // pgConnection: DBConnect, probably don't want to allow SQL
        APIfetch: fetch,
        // TO-DO: Need to pass Auth headers to evaluator API calls
        graphQLConnection: { fetch, endpoint: graphQLEndpoint },
      })
    )
    evaluationFieldArray.push('HEADER')
  }

  const resolvedValues = await Promise.all(evaluationPromiseArray)

  // Replace evaluated values in item
  resolvedValues.forEach((value, index) => {
    const field = evaluationFieldArray[index]
    if (field === 'HEADER') header.value = value
    else item[field] = value
  })

  return { id, header, columns, displayDefinitions, item, linkedApplications }
}
