import DBConnect from '../databaseConnect'
import { getDistinctObjects, getValidTableName, objectKeysToCamelCase } from '../utilityFunctions'
import {
  getPermissionNamesFromJWT,
  buildAllColumnDefinitions,
  constructTableResponse,
  constructDetailsResponse,
  getFilters,
} from './helpers'
import {
  queryDataTable,
  queryDataTableSingleItem,
  queryFilterList,
  queryLinkedApplications,
} from './gqlDynamicQueries'
import { camelCase, kebabCase } from 'lodash'
import { ColumnDefinition, LinkedApplication, DataViewsResponse } from './types'
import { DataView } from '../../generated/graphql'

const routeDataViews = async (request: any, reply: any) => {
  const { permissionNames } = await getPermissionNamesFromJWT(request)
  const dataViews = await DBConnect.getAllowedDataViews(permissionNames)
  const distinctDataViews = getDistinctObjects(dataViews, 'code', 'priority')
  const dataViewResponse: DataViewsResponse = distinctDataViews.map(
    ({ table_name, title, code }) => ({
      tableName: camelCase(table_name),
      title,
      code,
      urlSlug: kebabCase(code),
    })
  )
  return reply.send(dataViewResponse)
}

const routeDataViewTable = async (request: any, reply: any) => {
  const authHeaders = request?.headers?.authorization
  const dataViewCode = camelCase(request.params.dataViewCode)
  const { userId, orgId, permissionNames } = await getPermissionNamesFromJWT(request)
  const query = objectKeysToCamelCase(request.query)
  const filter = request.body ?? {}

  // GraphQL pagination parameters
  const first = query?.first ? Number(query.first) : 20
  const offset = query?.offset ? Number(query.offset) : 0
  const orderBy = query?.orderBy ?? 'id'
  const ascending = query?.ascending ? query?.ascending === 'true' : true

  const {
    tableName,
    columnDefinitionMasterList,
    fieldNames,
    searchFields,
    filterDefinitions,
    gqlFilters,
    title,
    code,
  } = await buildAllColumnDefinitions({
    permissionNames,
    dataViewCode,
    type: 'TABLE',
    filter,
    userId,
    orgId,
  })

  // GraphQL query -- get ALL fields (passing JWT), with pagination
  const { fetchedRecords, totalCount, error } = await queryDataTable(
    tableName,
    fieldNames,
    gqlFilters,
    first,
    offset,
    orderBy,
    ascending,
    authHeaders
  )
  if (error) return error

  const response = await constructTableResponse(
    tableName,
    title,
    code,
    columnDefinitionMasterList,
    fetchedRecords,
    totalCount,
    searchFields,
    filterDefinitions
  )

  return reply.send(response)
}

const routeDataViewDetail = async (request: any, reply: any) => {
  const authHeaders = request?.headers?.authorization
  const dataViewCode = camelCase(request.params.dataViewCode)
  const recordId = Number(request.params.id)
  const { userId, orgId, permissionNames } = await getPermissionNamesFromJWT(request)

  const {
    tableName,
    columnDefinitionMasterList,
    title,
    fieldNames,
    gqlFilters,
    headerDefinition,
    showLinkedApplications,
  } = await buildAllColumnDefinitions({
    permissionNames,
    dataViewCode,
    type: 'DETAIL',
    userId,
    orgId,
  })

  // GraphQL query -- get ALL fields (passing JWT), with pagination
  const fetchedRecord = await queryDataTableSingleItem(
    tableName,
    fieldNames,
    gqlFilters,
    recordId,
    authHeaders
  )

  if (fetchedRecord?.error) return fetchedRecord

  // GraphQL query to get linked applications -- this one with Admin JWT!
  const linkedApplications = showLinkedApplications
    ? await queryLinkedApplications(recordId, tableName)
    : undefined

  const response = await constructDetailsResponse(
    tableName,
    title,
    columnDefinitionMasterList,
    headerDefinition as ColumnDefinition,
    fetchedRecord,
    linkedApplications as LinkedApplication[]
  )

  return reply.send(response)
}

const routeDataViewFilterList = async (request: any, reply: any) => {
  const authHeaders = request?.headers?.authorization
  const dataViewCode = camelCase(request.params.dataViewCode)
  const columnName = request.params.column
  const { userId, orgId, permissionNames } = await getPermissionNamesFromJWT(request)

  const dataViews = (await DBConnect.getAllowedDataViews(permissionNames, dataViewCode))
    .map((dataView) => objectKeysToCamelCase(dataView))
    .sort((a, b) => b.priority - a.priority) as DataView[]

  if (dataViews.length === 0) throw new Error(`No matching data views: "${dataViewCode}"`)

  const dataView = dataViews[0]

  // Check column exists on highest priority dataView
  if (!dataView.tableViewIncludeColumns?.includes(columnName))
    throw new Error(`Column "${dataViewCode}" not available on data view: "${dataView.title}"`)

  // GraphQL query column including row_restrictions
  const gqlFilters = getFilters(dataView, userId, orgId)

  const items = (
    await queryFilterList(
      camelCase(getValidTableName(dataView.tableName)),
      columnName,
      gqlFilters,
      authHeaders
    )
  ).map((item: { [key: string]: unknown }) => item[columnName])

  // TO-DO: How to handle very large lists?
  return reply.send([...new Set(items)])
}

export { routeDataViews, routeDataViewTable, routeDataViewDetail, routeDataViewFilterList }
