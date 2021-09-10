import databaseConnect from '../databaseConnect'
import { getTokenData, extractJWTfromHeader } from '../permissions/loginHelpers'
import { getDistinctObjects, objectKeysToCamelCase } from '../utilityFunctions'
import { camelCase, snakeCase } from 'lodash'
import { plural } from 'pluralize'

const routeOutcomes = async (request: any, reply: any) => {
  const permissionNames = await getPermissionNamesFromJWT(request)
  const outcomes = await databaseConnect.getAllowedOutcomeDisplays(permissionNames)
  const distinctOutcomes = getDistinctObjects(outcomes, 'table_name', 'conflict_priority')
  return reply.send(
    distinctOutcomes.map(({ table_name, title, code }) => ({ tableName: table_name, title, code }))
  )
}

const routeOutcomesTable = async (request: any, reply: any) => {
  const authHeaders = request?.headers?.authorization
  const { tableName } = request.params
  const tableNamePlural = plural(tableName)
  const permissionNames = await getPermissionNamesFromJWT(request)
  const query = objectKeysToCamelCase(request.query)
  const first = query?.first ? Number(query.first) : 20
  const offset = query?.offset ? Number(query.offset) : 0
  const orderBy = query?.orderBy ?? 'id'
  const ascending = query?.ascending ? Boolean(query.ascending) : true

  const outcomeTables = await databaseConnect.getAllOutcomeTableNames()
  if (!outcomeTables.includes(tableName)) throw new Error('Invalid table name')

  const outcomes = await databaseConnect.getAllowedOutcomeDisplays(permissionNames, tableName)

  // Terminology: to avoid confustion "Columns" refers to the names of the table
  // columns that are *output*. "Fields" refers to the names of the
  // columns/fields on the original outcome table.

  // Get all Field names (schema query)
  const fieldNames = await databaseConnect.getOutcomeTableColumns(tableName)
  const fieldNamesString = fieldNames.map((field) => camelCase(field.name)).join(', ')

  // GraphQL query -- get ALL fields (passing JWT), with pagination
  const graphQLquery = `query getOutcomeRecords { ${tableNamePlural}(first: ${first}, offset: ${offset}, orderBy: ${snakeCase(
    orderBy
  ).toUpperCase()}_${ascending ? 'ASC' : 'DESC'}) { nodes { ${fieldNamesString} }}}`

  const fetchedRecords = (await databaseConnect.gqlQuery(graphQLquery, {}, authHeaders))?.[
    tableNamePlural
  ]?.nodes

  // Get all display_details records
  console.log('outcomes', outcomes)

  // Get all returning columns (include/exclude + details) and identify them as either standard fields or queries

  // Iterate over returned records:
  // - For each, iterate over columns, and either fill the value from query result, or perform the query (Be good to do some Async evalutation here)

  // Return constructed object

  return reply.send(fetchedRecords)
}

export { routeOutcomes, routeOutcomesTable }

const getPermissionNamesFromJWT = async (request: any): Promise<string[]> => {
  const { userId, orgId } = await getTokenData(extractJWTfromHeader(request))
  return await (
    await databaseConnect.getUserOrgPermissionNames(userId, orgId)
  ).map((result) => result.permissionName)
}

const createOrderByString = (orderBy: string, ascending: boolean) =>
  `${orderBy.toUpperCase()}_${ascending ? 'ASC' : 'DESC'}`
