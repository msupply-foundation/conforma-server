import DBConnect from '../databaseConnect'
import { getDistinctObjects, objectKeysToCamelCase } from '../utilityFunctions'
import {
  getPermissionNamesFromJWT,
  buildColumnList,
  buildColumnDisplayDefinitions,
  queryOutcomeTable,
  constructResponse,
} from './helpers'
import { camelCase } from 'lodash'
import { OutcomeDisplay } from '../../generated/graphql'
import { OutcomeResult, OutcomesTableResult } from './types'

const routeOutcomes = async (request: any, reply: any) => {
  const permissionNames = await getPermissionNamesFromJWT(request)
  const outcomes = await DBConnect.getAllowedOutcomeDisplays(permissionNames)
  const distinctOutcomes = getDistinctObjects(outcomes, 'table_name', 'conflict_priority')
  const outcomeResponse: OutcomeResult = distinctOutcomes.map(({ table_name, title, code }) => ({
    tableName: table_name,
    title,
    code,
  }))
  return reply.send(outcomeResponse)
}

const routeOutcomesTable = async (request: any, reply: any) => {
  const authHeaders = request?.headers?.authorization
  const tableName = camelCase(request.params.tableName)
  const permissionNames = await getPermissionNamesFromJWT(request)
  const query = objectKeysToCamelCase(request.query)

  // GraphQL pagination parameters
  const first = query?.first ? Number(query.first) : 20
  const offset = query?.offset ? Number(query.offset) : 0
  const orderBy = query?.orderBy ?? 'id'
  const ascending = query?.ascending ? Boolean(query.ascending) : true

  const outcomesTableResponse: OutcomesTableResult = {
    headerRow: [],
    tableRows: [],
    totalCount: 0,
  }

  const outcomeTables = await DBConnect.getAllTableNames()
  if (!outcomeTables.includes(tableName)) throw new Error('Invalid table name')

  const outcomes = (await DBConnect.getAllowedOutcomeDisplays(permissionNames, tableName))
    .map((outcome) => objectKeysToCamelCase(outcome))
    .sort((a, b) => b.conflictPriority - a.conflictPriority) as OutcomeDisplay[]

  if (outcomes.length === 0)
    return {
      ...outcomesTableResponse,
      message: `No outcomes available for table "${tableName}"`,
    }

  // Terminology: to avoid confustion "Columns" refers to the names of the table
  // columns that are *output*. "Fields" refers to the names of the
  // columns/fields on the original outcome table.

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
  const columnsToReturn: string[] = buildColumnList(outcomes, fieldNames, 'TABLE')

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

  // GraphQL query -- get ALL fields (passing JWT), with pagination
  const { fetchedRecords, totalCount } = await queryOutcomeTable(
    tableName,
    fieldNames,
    first,
    offset,
    orderBy,
    ascending,
    authHeaders
  )

  // Finally, use all of the above to build a structured Response object
  const response = await constructResponse(columnDefinitionMasterList, fetchedRecords, totalCount)

  return reply.send(response)
}

export { routeOutcomes, routeOutcomesTable }
