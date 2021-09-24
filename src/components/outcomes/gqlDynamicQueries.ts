import DBConnect from '../databaseConnect'
import { plural } from 'pluralize'
import { snakeCase } from 'lodash'
import { LinkedApplication } from './types'

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
  const fieldNameString = fieldNames.join(', ')
  const orderByType = `${snakeCase(orderBy).toUpperCase()}_${ascending ? 'ASC' : 'DESC'}`
  const variables = { first, offset }
  const graphQLquery = `query getOutcomeRecords($first: Int!, $offset: Int!) { ${tableNamePlural}(first: $first, offset: $offset, orderBy: ${orderByType}) { nodes { ${fieldNameString} }, totalCount}}`

  let queryResult
  try {
    queryResult = await DBConnect.gqlQuery(graphQLquery, variables, authHeaders)
  } catch (err) {
    return {
      error: { error: true, message: 'Problem with Outcome Table query', detail: err.message },
    }
  }
  const fetchedRecords = queryResult?.[tableNamePlural]?.nodes
  const totalCount = queryResult?.[tableNamePlural]?.totalCount
  return { fetchedRecords, totalCount }
}

export const queryOutcomeTableSingleItem = async (
  tableName: string,
  fieldNames: string[],
  id: number,
  authHeaders: string
) => {
  const fieldNameString = fieldNames.join(', ')
  const graphQLquery = `query getOutcomeRecord($id:Int!){ ${tableName}(id: $id) {${fieldNameString}}}`
  let queryResult
  try {
    queryResult = await DBConnect.gqlQuery(graphQLquery, { id }, authHeaders)
  } catch (err) {
    return { error: true, message: 'Problem with Outcome Item query', detail: err.message }
  }

  const fetchedRecord = queryResult?.[tableName]
  return fetchedRecord
}

export const queryLinkedApplications = async (id: number, tableName: string) => {
  // NB: Uses Admin authorization
  const joinTableName = `${tableName}ApplicationJoins`
  const idField = `${tableName}Id`
  const graphQLquery = `query getLinkedApplications($id: Int!) { ${joinTableName}(filter: {${idField}: {equalTo: $id}}) { nodes { application { id, name, serial, stage, template { name, code }, applicationStageHistories(filter: {isCurrent: {equalTo: true}}) { nodes { stage { number, title }, applicationStatusHistories(filter: {isCurrent: {equalTo: true}}) { nodes { status, timeCreated }}}}}}}}`

  let queryResult
  try {
    queryResult = await DBConnect.gqlQuery(graphQLquery, { id })
  } catch (err) {
    return [{ error: true, message: 'Problem with Linked Applications query', detail: err.message }]
  }

  const linkedApplications: LinkedApplication[] = queryResult?.[joinTableName]?.nodes.map(
    ({ application }: any) => ({
      id: application?.id,
      name: application?.name,
      serial: application?.serial,
      templateName: application?.template?.name,
      templateCode: application?.template?.code,
      dateCompleted:
        application?.applicationStageHistories?.nodes[0]?.applicationStatusHistories?.nodes[0]
          ?.timeCreated,
    })
  )
  return linkedApplications
}
