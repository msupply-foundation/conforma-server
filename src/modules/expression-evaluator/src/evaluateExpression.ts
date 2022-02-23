import {
  IConnection,
  IParameters,
  IGraphQLConnection,
  OutputType,
  BasicObject,
  EvaluateExpression,
  EvaluateExpressionInstance,
  IsEvaluationExpression,
} from './types'

import buildObject, { BuildObjectQuery } from './resolvers/buildObject'

const defaultParameters: IParameters = {}

export const isEvaluationExpression: IsEvaluationExpression = (expressionOrValue) =>
  expressionOrValue instanceof Object &&
  expressionOrValue !== null &&
  !Array.isArray(expressionOrValue) &&
  !!expressionOrValue.operator

const evaluateExpression: EvaluateExpression = async (inputQuery, params = defaultParameters) => {
  // Base cases -- leaves get returned unmodified
  if (!(inputQuery instanceof Object)) return inputQuery
  if ('value' in inputQuery) return inputQuery.value // Deprecate this soon
  if (!('operator' in inputQuery)) return inputQuery

  const evaluationExpressionInstance: EvaluateExpressionInstance = (_inputQuery) =>
    evaluateExpression(_inputQuery, params)

  let childrenResolved: any[] = []
  // Recursive case
  if ('children' in inputQuery) {
    childrenResolved = await Promise.all(
      inputQuery.children.map((child: any) => evaluationExpressionInstance(child))
    )
  }
  let result: any
  switch (inputQuery.operator) {
    case 'AND':
      result = childrenResolved.reduce((acc: boolean, child: boolean) => {
        return acc && child
      }, true)

    case 'OR':
      result = childrenResolved.reduce((acc: boolean, child: boolean) => {
        return acc || child
      }, false)

    case 'REGEX':
      try {
        const str: string = childrenResolved[0]
        const re: RegExp = new RegExp(childrenResolved[1])
        result = re.test(str)
      } catch {
        throw new Error('Problem with REGEX')
      }

    case '=':
      result = childrenResolved.every((child) => child == childrenResolved[0])

    case '!=':
      result = childrenResolved[0] != childrenResolved[1]

    case 'CONCAT':
    case '+':
      if (childrenResolved.length === 0) {
        result = childrenResolved
        break
      }

      // Reduce based on "type" if specified
      if (inputQuery?.type === 'string') {
        result = childrenResolved.reduce((acc, child) => acc.concat(child), '')
        break
      }
      if (inputQuery?.type === 'array') {
        result = childrenResolved.reduce((acc, child) => acc.concat(child), [])
        break
      }

      // Concatenate arrays/strings
      if (childrenResolved.every((child) => typeof child === 'string' || Array.isArray(child))) {
        result = childrenResolved.reduce((acc, child) => acc.concat(child))
        break
      }

      // Merge objects
      if (childrenResolved.every((child) => child instanceof Object && !Array.isArray(child))) {
        {
          result = childrenResolved.reduce((acc, child) => ({ ...acc, ...child }), {})
          break
        }
      }

      // Or just try to add any other types
      result = childrenResolved.reduce((acc: number, child: number) => acc + child)

    case '?':
      result = childrenResolved[0] ? childrenResolved[1] : childrenResolved[2]

    case 'objectProperties':
      if (Object.entries(params).length === 0)
        return 'No parameters received for objectProperties node'
      try {
        const inputObject = params?.objects ? params.objects : {}
        const property = childrenResolved[0]
        const fallback = childrenResolved?.[1]
        result = extractProperty(inputObject, property, fallback)
      } catch {
        throw new Error('Problem evaluating object')
      }

    case 'stringSubstitution':
      const origString: string = childrenResolved[0]
      const replacements = childrenResolved.slice(1)
      const regex = /%([\d]+)/g // To-Do: handle escaping literal values
      const parameters = (origString.match(regex) || []).sort(
        (a, b) => Number(a.slice(1)) - Number(b.slice(1))
      )
      const uniqueParameters = new Set(parameters)
      const replacementsObj = zipArraysToObject(Array.from(uniqueParameters), replacements)
      let outputString = origString
      Object.entries(replacementsObj)
        .reverse()
        .forEach(([param, replacement]) => {
          outputString = outputString.replace(new RegExp(`${param}`, 'g'), replacement ?? '')
        })
      result = outputString

    case 'POST':
    case 'GET':
    case 'API':
      const { APIfetch } = params
      const isPostRequest = inputQuery.operator === 'POST'
      let urlWithQuery, returnedProperty, requestBody, headers
      try {
        const {
          url,
          headers: queryHeaders,
          fieldNames,
          values,
          returnProperty,
        } = assignChildNodesToQuery([
          '', // Extra unused field for GET/POST (query)
          ...childrenResolved,
        ])
        headers = queryHeaders ?? params?.headers
        returnedProperty = returnProperty
        urlWithQuery =
          fieldNames.length > 0
            ? `${url}?${fieldNames
                .map((field: string, index: number) => field + '=' + values[index])
                .join('&')}`
            : url
        requestBody = isPostRequest ? zipArraysToObject(fieldNames, values) : null
      } catch {
        throw new Error('Invalid API query')
      }
      let data
      try {
        data = isPostRequest
          ? await fetchAPIrequest({
              url: urlWithQuery,
              APIfetch,
              method: 'POST',
              body: requestBody,
              headers,
            })
          : await fetchAPIrequest({ url: urlWithQuery, APIfetch, headers })
      } catch {
        throw new Error('Problem with API call')
      }
      try {
        result = extractAndSimplify(data, returnedProperty, "API - Can't resolve property")
      } catch {
        throw new Error('Problem parsing requested node from API result')
      }

    case 'pgSQL':
      if (!params.pgConnection) throw new Error('No Postgres database connection provided')
      result = processPgSQL(childrenResolved, inputQuery?.type as OutputType, params.pgConnection)

    case 'graphQL':
      if (!params.graphQLConnection) throw new Error('No GraphQL database connection provided')
      const gqlHeaders = params?.headers ?? params.graphQLConnection.headers
      result = processGraphQL(childrenResolved, params.graphQLConnection, gqlHeaders)

    case 'buildObject':
      result = buildObject(inputQuery as BuildObjectQuery, evaluationExpressionInstance)

    case 'objectFunctions':
      const inputObject = params?.objects ? params.objects : {}
      const funcName = childrenResolved[0]
      const args = childrenResolved.slice(1)
      const func = extractProperty(inputObject, funcName, 'Function not found') as Function
      result = await func(...args)

    default:
      return 'No matching operators'

    // etc. for as many other operators as we want/need.
  }

  return result
}

async function processPgSQL(queryArray: any[], queryType: string, connection: IConnection) {
  const expression = {
    text: queryArray[0],
    values: queryArray.slice(1),
    rowMode: queryType ? 'array' : '',
  }
  try {
    const res = await connection.query(expression)
    switch (queryType) {
      case 'array':
        return res.rows.flat()
      case 'string':
        return res.rows.flat().join(' ')
      case 'number':
        return Number(res.rows.flat())
      default:
        return res.rows
    }
  } catch (err) {
    throw err
  }
}

/*
 * processGraphQL
 * Will process the call to a GraphQL API (internal or external) using params
 * received in the queryArray to determine the following:
 * @param queryArray
 *   - url: string with an external API or "graphQLEndpoint" for internal [Default]
 *   - query: GraphQL query to call (including the fields to be returned)
 *  A list of dynamic props to pass (break-down in 2 fields)
 *   - fieldNames: array of field names included in the query
 *   - values: array of values to be passed for each field names
 *  And the returned field:
 *   - returnProperty: string (which can be in any level of the query result)
 * @param connection
 *   - fetch: Method used for fetching (front-end bind to browser)
 */
async function processGraphQL(
  queryArray: any[],
  connection: IGraphQLConnection,
  gqlHeaders: { [key: string]: string } = {}
) {
  try {
    const {
      url,
      headers: queryHeaders,
      query,
      fieldNames,
      values,
      returnProperty,
    } = assignChildNodesToQuery(queryArray)
    const variables = zipArraysToObject(fieldNames, values)
    const headers = queryHeaders ?? gqlHeaders
    const data = await graphQLquery(url, query, variables, connection, headers)
    if (!data) throw new Error('GraphQL query problem')
    try {
      return extractAndSimplify(data, returnProperty, "GraphQL - Can't resolve node")
    } catch (err) {
      throw new Error('GraphQL -- unable to retrieve node')
    }
  } catch (err) {
    throw new Error(err.message)
  }
}

const extractAndSimplify = (
  data: BasicObject | BasicObject[],
  returnProperty: string | undefined,
  fallback: any = "Can't resolve property"
) => {
  const selectedProperty = returnProperty ? extractProperty(data, returnProperty, fallback) : data
  if (Array.isArray(selectedProperty)) return selectedProperty.map((item) => simplifyObject(item))
  if (returnProperty) {
    if (selectedProperty === null) return null // GraphQL field can return null as valid result
    return simplifyObject(selectedProperty)
  }
  return selectedProperty
}

const assignChildNodesToQuery = (childNodes: any[]) => {
  const skipFields = 3 // skip query, url and fieldNames
  const query: string = childNodes[0]
  let url: string
  let headers: { [key: string]: string } | null = null
  if (typeof childNodes[1] === 'object') {
    url = childNodes[1].url
    headers = childNodes[1].headers
  } else url = childNodes[1]
  const fieldNames: string[] = childNodes[2]

  const lastFieldIndex = fieldNames.length + skipFields
  const values: string[] = childNodes.slice(skipFields, lastFieldIndex)
  const returnProperty: string = childNodes[lastFieldIndex]

  return { url, headers, query, fieldNames, values, returnProperty }
}

// Build an object from an array of field names and an array of values
const zipArraysToObject = (variableNames: string[], variableValues: any[]) => {
  const createdObject: BasicObject = {}
  variableNames.map((name, index) => {
    createdObject[name] = variableValues[index]
  })
  return createdObject
}

// Returns a specific property (e.g. application.name) from a nested Object
const extractProperty = (
  data: BasicObject | BasicObject[],
  node: string | string[],
  fallback: any = "Can't resolve object"
): BasicObject | string | number | boolean | BasicObject[] | Function => {
  if (typeof data === 'undefined') return fallback
  const propertyPathArray = Array.isArray(node) ? node : node.split('.')
  // ie. "application.template.name" => ["applcation", "template", "name"]
  if (Array.isArray(data)) {
    // If an array, extract the property from *each item*
    return data.map((item) => extractProperty(item, propertyPathArray, fallback))
  }
  const currentProperty = propertyPathArray[0]
  if (propertyPathArray.length === 1)
    return data?.[currentProperty] === undefined ? fallback : data[currentProperty]
  else return extractProperty(data?.[currentProperty], propertyPathArray.slice(1), fallback)
}

// If Object has only 1 property, return just the value of that property,
// else return the whole object.
const simplifyObject = (item: number | string | boolean | BasicObject) => {
  return typeof item === 'object' && Object.keys(item).length === 1 ? Object.values(item)[0] : item
}

// Abstraction for GraphQL database query using Fetch
const graphQLquery = async (
  url: string,
  query: string,
  variables: object,
  connection: IGraphQLConnection,
  headers: { [key: string]: string }
) => {
  // Get an external endpoint to use, or get the default GraphQL endpoint if received:
  // "graphqlendpoint" (case insensitive), an empty string "" or null
  const endpoint =
    url !== null && url.toLowerCase() !== 'graphqlendpoint' && url !== ''
      ? url
      : connection.endpoint

  const queryResult = await connection.fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  })
  const data = await queryResult.json()
  if (data?.errors) {
    const errorMessage = data.errors[0].message
    throw new Error(errorMessage)
  }
  return data.data
}

interface APIrequestProps {
  url: string
  APIfetch: any
  method?: 'GET' | 'POST'
  body?: { [key: string]: string } | null
  headers?: { [key: string]: string }
}

// GET/POST request using fetch (node or browser variety)
const fetchAPIrequest = async ({
  url,
  APIfetch,
  method = 'GET',
  body,
  headers = {},
}: APIrequestProps) => {
  const result = await APIfetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
  return await result.json()
}

export default evaluateExpression
