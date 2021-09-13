import DBConnect from '../databaseConnect'
import { getDistinctObjects, objectKeysToCamelCase } from '../utilityFunctions'
import {
  getPermissionNamesFromJWT,
  buildAllColumnDefinitions,
  constructTableResponse,
  constructDetailsResponse,
} from './helpers'
import {
  queryOutcomeTable,
  queryOutcomeTableSingleItem,
  queryLinkedApplications,
} from './gqlDynamicQueries'
import { camelCase } from 'lodash'
import { ColumnDefinition, OutcomesResponse } from './types'

const routeOutcomes = async (request: any, reply: any) => {
  const permissionNames = await getPermissionNamesFromJWT(request)
  const outcomes = await DBConnect.getAllowedOutcomeDisplays(permissionNames)
  const distinctOutcomes = getDistinctObjects(outcomes, 'table_name', 'priority')
  const outcomeResponse: OutcomesResponse = distinctOutcomes.map(({ table_name, title, code }) => ({
    tableName: camelCase(table_name),
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

  const { columnDefinitionMasterList, fieldNames } = await buildAllColumnDefinitions(
    permissionNames,
    tableName,
    'TABLE'
  )

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

  const response = await constructTableResponse(
    columnDefinitionMasterList,
    fetchedRecords,
    totalCount
  )

  return reply.send(response)
}

const routeOutcomesDetail = async (request: any, reply: any) => {
  const authHeaders = request?.headers?.authorization
  const tableName = camelCase(request.params.tableName)
  const recordId = Number(request.params.id)
  const permissionNames = await getPermissionNamesFromJWT(request)

  const { columnDefinitionMasterList, fieldNames, headerDefinition, showLinkedApplications } =
    await buildAllColumnDefinitions(permissionNames, tableName, 'DETAIL')

  // GraphQL query -- get ALL fields (passing JWT), with pagination
  const fetchedRecord = await queryOutcomeTableSingleItem(
    tableName,
    fieldNames,
    recordId,
    authHeaders
  )

  // GraphQL query to get linked applications -- this one with Admin JWT!
  const linkedApplications = showLinkedApplications
    ? await queryLinkedApplications(recordId, tableName)
    : undefined

  const response = await constructDetailsResponse(
    columnDefinitionMasterList,
    headerDefinition as ColumnDefinition,
    fetchedRecord,
    linkedApplications
  )

  return reply.send(response)
}

export { routeOutcomes, routeOutcomesTable, routeOutcomesDetail }
