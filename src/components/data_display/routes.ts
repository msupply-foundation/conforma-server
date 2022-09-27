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
import config from '../../config'

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
  const { searchFields = [columnName], searchText = '', delimiter } = request.body ?? {}
  const { userId, orgId, permissionNames } = await getPermissionNamesFromJWT(request)

  const dataViews = (await DBConnect.getAllowedDataViews(permissionNames, dataViewCode))
    .map((dataView) => objectKeysToCamelCase(dataView))
    .sort((a, b) => b.priority - a.priority) as DataView[]

  if (dataViews.length === 0) throw new Error(`No matching data views: "${dataViewCode}"`)

  const dataView = dataViews[0]

  // TO-DO: Create search filters for types other than string (number, bool, array)
  const searchFilter = {
    or: searchFields.map((col: string) => ({
      [col]: {
        includesInsensitive: searchText,
      },
    })),
  }

  const gqlFilters = { ...getFilters(dataView, userId, orgId), ...searchFilter }

  const filterList = new Set()

  let fetchedCount = 0
  let offset = 0
  let moreResultsAvailable = true

  while (filterList.size < config.filterListMaxLength) {
    const { fetchedRecords, totalCount, error } = await queryFilterList(
      camelCase(getValidTableName(dataView.tableName)),
      searchFields,
      gqlFilters,
      config.filterListMaxLength,
      offset,
      authHeaders
    )

    if (error) return reply.send(error)

    fetchedCount += fetchedRecords.length

    fetchedRecords.forEach((record: { [key: string]: unknown }) => {
      const values = Object.values(record)
      values.forEach((value) => {
        if (delimiter && typeof value === 'string') {
          const splitString = value.split(delimiter).map((e) => e.trim())
          splitString.forEach((string) => filterList.add(string))
        } else filterList.add(value)
      })
    })

    if (fetchedCount >= totalCount) {
      moreResultsAvailable = false
      break
    }

    offset += fetchedRecords.length
  }

  let results = [...filterList].sort()

  // If searching multiple fields, then we'll also get back the *other* values
  // in the record matching the search text. We need to filter those out:
  if (searchFields.length > 1)
    results = results.filter(
      (value) =>
        typeof value === 'string' && new RegExp(searchText.toLowerCase()).test(value.toLowerCase())
    )

  if (results.length > config.filterListMaxLength) moreResultsAvailable = true

  return reply.send({ list: results.slice(0, config.filterListMaxLength), moreResultsAvailable })
}

export { routeDataViews, routeDataViewTable, routeDataViewDetail, routeDataViewFilterList }
