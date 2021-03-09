import { IConnection, IQueryNode, IParameters, IGraphQLConnection, BasicObject } from './types'

const defaultParameters: IParameters = {}

export default async function evaluateExpression(
  inputQuery: IQueryNode | string | number | boolean | any[],
  params: IParameters = defaultParameters
): Promise<string | number | boolean | BasicObject | any[]> {
  // If input is not object, try and parse it as a JSON string. If that fails, return the input without any processing.
  let query
  if (
    !(inputQuery instanceof Object) ||
    Array.isArray(inputQuery) ||
    inputQuery === null ||
    inputQuery === undefined
  ) {
    if (typeof inputQuery === 'string') {
      try {
        query = JSON.parse(inputQuery)
      } catch {
        return inputQuery
      }
    } else return inputQuery
  } else query = inputQuery

  // Base case
  if (!query.children) {
    return query.value !== undefined ? query.value : query
  }

  // Recursive case
  else {
    const childrenResolved: any[] = await Promise.all(
      query.children.map((child: IQueryNode) => evaluateExpression(child, params))
    )

    switch (query.operator) {
      case 'AND':
        return childrenResolved.reduce((acc: boolean, child: boolean) => {
          return acc && child
        }, true)

      case 'OR':
        return childrenResolved.reduce((acc: boolean, child: boolean) => {
          return acc || child
        }, false)

      case 'CONCAT':
        if (query.type === 'array') {
          return childrenResolved.reduce((acc: any, child: any) => {
            return acc.concat(child) // .flat(1) doesn't work for some reason
          }, [])
        } else if (query.type === 'string' || !query.type) {
          return childrenResolved.join('')
        }
        break

      case 'REGEX':
        try {
          const str: string = childrenResolved[0]
          const re: RegExp = new RegExp(childrenResolved[1])
          return re.test(str)
        } catch {
          throw new Error('Problem with REGEX')
        }

      case '=':
        // eslint-disable-next-line
        return childrenResolved.every((child) => child == childrenResolved[0])

      case '!=':
        // eslint-disable-next-line
        return childrenResolved[0] != childrenResolved[1]

      case '+':
        return childrenResolved.reduce((acc: number, child: number) => {
          return acc + child
        }, 0)

      case '?':
        return childrenResolved[0] ? childrenResolved[1] : childrenResolved[2]

      case 'objectProperties':
        if (Object.entries(params).length === 0)
          return 'No parameters received for objectProperties node'
        try {
          const inputObject = params?.objects ? params.objects : {}
          const property = childrenResolved[0]
          const fallback = childrenResolved?.[1]
          return extractProperty(inputObject, property, fallback)
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
        let i = 0
        return parameters.reduce((outputString, param) => {
          return outputString.replace(param, replacements[i] !== undefined ? replacements[i++] : '')
        }, origString)

      case 'API':
        let url, urlWithQuery, queryFields, queryValues: string[], returnProperty
        try {
          ;[url, queryFields, queryValues, returnProperty] = assignChildNodesToQuery(
            childrenResolved
          )
          urlWithQuery =
            queryFields.length > 0
              ? `${url}?${queryFields
                  .map((field: string, index: number) => field + '=' + queryValues[index])
                  .join('&')}`
              : url
        } catch {
          throw new Error('Invalid API query')
        }
        let data
        try {
          data = await fetchAPIdata(urlWithQuery, params.APIfetch)
        } catch {
          throw new Error('Problem with API call')
        }
        try {
          return extractAndSimplify(data, returnProperty)
        } catch {
          throw new Error('Problem parsing requested node from API result')
        }

      case 'pgSQL':
        if (!params.pgConnection) throw new Error('No Postgres database connection provided')
        return processPgSQL(childrenResolved, query.type, params.pgConnection)

      case 'graphQL':
        if (!params.graphQLConnection) throw new Error('No GraphQL database connection provided')
        return processGraphQL(childrenResolved, params.graphQLConnection)

      // etc. for as many other operators as we want/need.
    }
  }
  return 'No matching operators'
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

async function processGraphQL(queryArray: any[], connection: IGraphQLConnection) {
  try {
    const [query, variableNames, variableValues, returnProperty] = assignChildNodesToQuery(
      queryArray
    )

    const variables = zipArraysToObject(variableNames, variableValues)

    const data = await graphQLquery(query, variables, connection)
    if (!data) throw new Error('GraphQL query problem')
    try {
      return extractAndSimplify(data, returnProperty)
    } catch (err) {
      throw new Error('GraphQL -- unable to retrieve node')
    }
  } catch (err) {
    throw new Error('GraphQL problem')
  }
}

const extractAndSimplify = (
  data: BasicObject | BasicObject[],
  returnProperty: string | undefined
) => {
  const selectedProperty = returnProperty ? extractProperty(data, returnProperty) : data
  return Array.isArray(selectedProperty)
    ? selectedProperty.map((item) => simplifyObject(item))
    : returnProperty
    ? simplifyObject(selectedProperty)
    : selectedProperty
}

const assignChildNodesToQuery = (childNodes: any[]) => {
  const query = childNodes[0]
  const fieldNames = childNodes[1]
  const values = childNodes.slice(2, fieldNames.length + 2)
  const returnProperty = childNodes[fieldNames.length + 2]
  return [query, fieldNames, values, returnProperty]
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
): BasicObject | string | number | boolean | BasicObject[] => {
  const propertyPathArray = Array.isArray(node) ? node : node.split('.')
  // ie. "application.template.name" => ["applcation", "template", "name"]
  if (Array.isArray(data)) {
    // If an array, extract the property from *each item*
    return data.map((item) => extractProperty(item, propertyPathArray, fallback))
  }
  const currentProperty = propertyPathArray[0]
  if (propertyPathArray.length === 1) return data?.[currentProperty] || fallback
  else return extractProperty(data[currentProperty], propertyPathArray.slice(1), fallback)
}

// If Object has only 1 property, return just the value of that property,
// else return the whole object.
const simplifyObject = (item: number | string | boolean | BasicObject) => {
  return typeof item === 'object' && Object.keys(item).length === 1 ? Object.values(item)[0] : item
}

// Abstraction for GraphQL database query using Fetch
const graphQLquery = async (query: string, variables: object, connection: IGraphQLConnection) => {
  const queryResult = await connection.fetch(connection.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    }),
  })
  const data = await queryResult.json()
  return data.data
}

// GET request using fetch (node or browser variety)
const fetchAPIdata = async (url: string, APIfetch: any) => {
  const result = await APIfetch(url)
  const data = await result.json()
  return data
}
