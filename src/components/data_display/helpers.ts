import DBConnect from '../databaseConnect'
import { objectKeysToCamelCase, getValidTableName } from '../utilityFunctions'
import evaluateExpression from '@openmsupply/expression-evaluator'
import fetch from 'node-fetch'
import { camelCase, snakeCase, startCase } from 'lodash'
// @ts-ignore
import mapValuesDeep from 'map-values-deep'
import {
  ColumnDefinition,
  ColumnDefinitionMasterList,
  ColumnDetailOutput,
  ColumnDisplayDefinitions,
  DetailsHeader,
  DisplayDefinition,
  LinkedApplication,
  DataViewsDetailResponse,
  DataViewsTableResponse,
} from './types'
import { DataView, DataViewColumnDefinition } from '../../generated/graphql'
import dataTypeMap, { PostgresDataType } from './postGresToJSDataTypes'
import config from '../../config'
import { plural } from 'pluralize'

// CONSTANTS
const REST_OF_DATAVIEW_FIELDS = '...'
const graphQLEndpoint = config.graphQLendpoint

type JWTData = {
  userId: number
  orgId?: number
  permissionNames: string[]
}
export const getPermissionNamesFromJWT = async (request: any): Promise<JWTData> => {
  const { userId, orgId } = request.auth
  const permissionNames = await (
    await DBConnect.getUserOrgPermissionNames(userId, orgId)
  ).map((result) => result.permissionName)
  return { userId, orgId, permissionNames }
}

export const buildAllColumnDefinitions = async ({
  permissionNames,
  dataViewCode,
  type,
  filter,
  userId,
  orgId,
}: {
  permissionNames: string[]
  dataViewCode: string
  type: 'TABLE' | 'DETAIL'
  filter?: object
  userId: number
  orgId: number | undefined
}): Promise<ColumnDetailOutput> => {
  // Look up allowed Data views
  const dataViews = (await DBConnect.getAllowedDataViews(permissionNames, dataViewCode))
    .map((dataView) => objectKeysToCamelCase(dataView))
    .sort((a, b) => b.priority - a.priority) as DataView[]

  if (dataViews.length === 0) throw new Error(`No matching data views: "${dataViewCode}"`)

  const dataView = dataViews[0]

  const { tableName, title, code, tableSearchColumns } = dataView

  const tableNameProper = camelCase(getValidTableName(tableName))

  // Generate graphQL filter object
  const gqlFilters = { ...filter, ...getFilters(dataView, userId, orgId) }

  // Only for details view
  const headerColumnName = dataView.detailViewHeaderColumn ?? ''
  const showLinkedApplications = dataView.showLinkedApplications

  // Get all Fields on Data table (schema query)
  const fields: { name: string; dataType: PostgresDataType }[] = (
    await DBConnect.getDataTableColumns(snakeCase(tableNameProper))
  ).map(({ name, dataType }) => ({
    name: camelCase(name),
    dataType: dataTypeMap?.[dataType as PostgresDataType] ?? dataType,
  }))
  const fieldNames = fields.map((field) => field.name)
  const fieldDataTypes = fields.reduce((dataTypeIndex: { [key: string]: string }, field) => {
    dataTypeIndex[field.name] = field.dataType
    return dataTypeIndex
  }, {})

  // Get all returning column names (include/exclude + custom columns)
  const columnsToReturn: string[] = buildColumnList(dataView, fieldNames, type)

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
    sortColumn: getSortColumn(column, fieldNameSet, customDisplayDefinitions),
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

  return {
    tableName: tableNameProper,
    title: title ?? plural(startCase(tableName)),
    code,
    columnDefinitionMasterList,
    gqlFilters,
    fieldNames,
    headerDefinition,
    searchFields: (tableSearchColumns as string[]) || [],
    showLinkedApplications,
  }
}

const getFilters = (dataView: DataView, userId: number, orgId: number | undefined): object => {
  const restrictions =
    dataView.rowRestrictions == null || Object.keys(dataView.rowRestrictions).length === 0
      ? { id: { isNull: false } }
      : dataView.rowRestrictions
  // Substitute userId/orgId placeholder with actual values
  return mapValuesDeep(restrictions, (node: any) => {
    if (typeof node !== 'string') return node
    switch (node) {
      case '$userId':
        return userId
      case '$orgId':
        return orgId ?? 0
      default:
        return node
    }
  })
}

const getSortColumn = (
  column: string,
  fieldNameSet: Set<string>,
  customDisplayDefinitions: ColumnDisplayDefinitions
) => {
  const definedSortColumn = customDisplayDefinitions[column]?.sortColumn
  if (definedSortColumn && !fieldNameSet.has(definedSortColumn))
    throw new Error('Invalid sort column name')
  if (definedSortColumn) return definedSortColumn
  if (fieldNameSet.has(column)) return column
  return undefined
}

const buildColumnList = (
  dataView: DataView,
  allColumns: string[],
  type: 'TABLE' | 'DETAIL'
): string[] => {
  const includeField = type === 'TABLE' ? 'tableViewIncludeColumns' : 'detailViewIncludeColumns'
  const excludeField = type === 'TABLE' ? 'tableViewExcludeColumns' : 'detailViewExcludeColumns'

  const includeColumns =
    dataView[includeField] === null
      ? allColumns
      : (dataView[includeField] as string[])
          // Expand "..." to all fields (so we don't have to enter the full
          // field list in "includeColumns" when also adding a "custom" field)
          .map((col) => (col === REST_OF_DATAVIEW_FIELDS ? allColumns : col))
          .flat()

  const excludeColumns = dataView[excludeField] !== null ? (dataView[excludeField] as string[]) : []

  // Convert to Set to remove duplicate columns due to expanded (...) field list
  const includeSet = new Set(includeColumns)
  return [...includeSet].filter((x) => !excludeColumns.includes(x))
}

const buildColumnDisplayDefinitions = async (
  tableName: string,
  columns: string[]
): Promise<ColumnDisplayDefinitions> => {
  const columnDefinitionArray = await DBConnect.getDataViewColumnDefinitions(tableName, columns)
  const columnDisplayDefinitions: ColumnDisplayDefinitions = {}
  columnDefinitionArray.forEach((item) => {
    columnDisplayDefinitions[item.column_name] = objectKeysToCamelCase(
      item
    ) as DataViewColumnDefinition
  })
  return columnDisplayDefinitions
}

export const constructTableResponse = async (
  tableName: string,
  title: string,
  code: string,
  columnDefinitionMasterList: ColumnDefinitionMasterList,
  fetchedRecords: { id: number; [key: string]: any }[],
  totalCount: number,
  searchFields: string[]
): Promise<DataViewsTableResponse> => {
  // Build table headers, which also carry any additional display/format
  // definitions for each column

  const headerRow = columnDefinitionMasterList.map(
    ({ columnName, isBasicField, dataType, columnDefinition = {}, sortColumn }) => {
      const { title, elementTypePluginCode, elementParameters, additionalFormatting } =
        columnDefinition
      return {
        columnName,
        title: title ?? startCase(columnName),
        isBasicField,
        dataType,
        sortColumn,
        formatting: {
          elementTypePluginCode: elementTypePluginCode || undefined,
          elementParameters: elementParameters || undefined,
          ...additionalFormatting,
        },
      }
    }
  )

  // Construct table rows by iterating over data table records
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
      if (isBasicField && !columnDefinition?.valueExpression) return record[columnName]
      else if (!columnDefinition?.valueExpression) return 'Field not defined'
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
    return { id: record.id, rowValues: thisRow, item: {} }
  })

  const resolvedValues = await Promise.all(evaluationPromiseArray)

  // Replace evaluated values in table structure
  resolvedValues.forEach((value, index) => {
    const { row, col } = evaluationIndexArray[index]
    tableRows[row].rowValues[col] = value
  })

  // Also provide a version of the row/item in Object form, just because
  tableRows.forEach((row: any) => {
    const item: { [key: string]: any } = {}
    columnDefinitionMasterList.forEach(
      ({ columnName }, index) => (item[columnName] = row.rowValues[index])
    )
    row.item = item
  })

  return { tableName, title, code, headerRow, tableRows, searchFields, totalCount }
}

export const constructDetailsResponse = async (
  tableName: string,
  tableTitle: string,
  columnDefinitionMasterList: ColumnDefinitionMasterList,
  headerDefinition: ColumnDefinition,
  fetchedRecord: { id: number; [key: string]: any },
  linkedApplications: LinkedApplication[] | undefined
): Promise<DataViewsDetailResponse> => {
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
      if (isBasicField && !columnDefinition?.valueExpression)
        obj[columnName] = fetchedRecord[columnName]
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
  else if (!headerDefinition?.columnDefinition?.valueExpression) header.value = 'Field not defined'
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

  return {
    tableName,
    tableTitle,
    id,
    header,
    columns,
    displayDefinitions,
    item,
    linkedApplications,
  }
}
