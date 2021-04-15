const fs = require('fs')
const { graphQLdefinition } = require('./graphQLdefinitions.js')
const { execSync } = require('child_process')
const { executeGraphQLQuery } = require('./insertData.js')

const defaultSnapshotName = 'current'
const seperator = '########### MUTATION END ###########'

const takeSnapshot = async (definitions) => {
  let snapshotName = process.argv[2] || defaultSnapshotName

  console.log('creating or updating snapshot: ', snapshotName)

  const snapshotFilename = 'database/snapshots/' + snapshotName + '.graphql'

  console.log(snapshotName, snapshotFilename)
  console.log('getting schema ...')
  const types = (await getSchema()).types
  console.log('getting schema ... done')

  console.log('creating queries ...')
  const tableNames = getTableNames(types)
  const inputTypes = getInputTypes(types, tableNames)
  const queries = sortAndFilterQueries(getQueries(inputTypes), definitions)

  console.log('creating queries ... done')

  console.log('executing queries ...')
  const queryResultsAll = await Promise.all(queries.map((query) => getQueryData(query)))
  const queryResults = queryResultsAll.filter(({ results }) => results.length > 0)
  console.log('executing queries ... done')

  console.log('creating mutations ...')
  const mutations = queryResults
    .map((queryResult) => generateMutations(queryResult, definitions))
    .flat()
  console.log('creating mutations ... done')

  console.log('saving mutations to file ...')
  saveMutationsToFile(mutations, snapshotFilename)
  console.log('saving mutations to file ... done')

  console.log('prettifying mutations ...')
  execSync('npx prettier --write "' + snapshotFilename + '"')
  console.log('prettifying mutations ... done')

  console.log('all ... done')
}

const getSchema = async () => {
  const jsonResult = await executeGraphQLQuery(`
  query IntrospectionQuery {
    __schema {
      types{
        kind, 
        name,
        fields {
            name
            type {
                kind
            }
        }
        inputFields {
          name,
          type {
            kind
            ofType {
              kind
            }
            name
          }
        }
      }
    }
  }`)

  return jsonResult.data.__schema
}
const getTableNames = (types) => {
  const query = types.find(({ name }) => name === 'Query')

  return query.fields
    .filter(({ type }) => (type.kind = 'OBJECT'))
    .map(({ name }) => name.toLowerCase())
}

const getInputTypes = (types, tableNames) => {
  const inputObjectType = types.filter((type) => type.kind === 'INPUT_OBJECT')
  const inputs = inputObjectType.filter((type) => type.name.endsWith('Input'))

  const noCreateUpdateOrDelete = inputs.filter(
    (type) =>
      !type.name.startsWith('Create') &&
      !type.name.startsWith('Update') &&
      !type.name.startsWith('Delete')
  )
  return noCreateUpdateOrDelete.filter(({ name }) =>
    tableNames.includes(toPlural(name.replace('Input', '')).toLowerCase())
  )
}

const toPlural = (string) => {
  if (string.endsWith('y')) return string.slice(0, string.length - 1) + 'ies'
  return string + 's'
}

const toSingular = (string) => {
  if (string.endsWith('ies')) return string.slice(0, string.length - 3) + 'y'
  return string.slice(0, string.length - 1)
}

const fromInputTypeToQueryType = (type) => {
  const queryName = toPlural(type.name.replace('Input', ''))
  const queryNameCamelCase = queryName[0].toLowerCase() + queryName.slice(1)
  return queryNameCamelCase
}

const getType = (field) => field.type?.ofType?.kind || field.type.kind
const getFieldName = (field) => field.type?.ofType?.name || field.type.name

const getQueries = (inputTypes) => {
  const queries = inputTypes.map((type) => {
    const queryName = fromInputTypeToQueryType(type)
    const rawFields = type.inputFields.filter(
      (field) => getType(field) === 'SCALAR' || getType(field) === 'ENUM'
    )
    const fields = rawFields.map((field) => field.name)

    const query = `query { ${queryName} { nodes {${fields.join(',')}} } }`

    return { query, queryName, fields, rawFields }
  })

  return queries
}

const getRecordNameFromQueryName = (queryName) => {
  return toSingular(queryName)
}

const sortAndFilterQueries = (queries, definitions) => {
  const sortedAndFilteredQueries = []

  definitions.forEach((definition) => {
    if (definition.skip) return
    const matchedQuery = queries.find(
      ({ queryName }) => getRecordNameFromQueryName(queryName) === definition.table
    )
    if (matchedQuery) sortedAndFilteredQueries.push(matchedQuery)
  })
  return sortedAndFilteredQueries
}

const getQueryData = async (query) => {
  const { query: gql, queryName } = query
  const json = await executeGraphQLQuery(gql)
  return { results: json.data[queryName].nodes, query }
}

const getMutationNameFromQueryName = (queryName) => {
  const queryNameSingular = getRecordNameFromQueryName(queryName)
  const queryNameCapitalised = queryNameSingular[0].toUpperCase() + queryNameSingular.slice(1)

  return 'create' + queryNameCapitalised
}
const isGeneratedColumn = (queryName, field, definitions) => {
  const tableName = toSingular(queryName)
  const definition = definitions.find((definition) => definition.table === tableName)

  if (definition?.generatedColumns?.includes(field)) return true

  return false
}

const getMutationFieldsAndValues = (record, rawFields, queryName, definitions) => {
  const fieldsAndValues = rawFields.map((field) => {
    const key = field.name
    let value = record[key]
    if (getType(field) === 'ENUM' && value != null) value = value.replace(/\"/g, '')
    else if (typeof record[key] === 'string') value = `${JSON.stringify(value)}`
    else if (typeof record[key] === 'object' && record[key] !== null)
      value = noQuoteKeyStringify(value)

    if (getFieldName(field) === 'Datetime') return '\n # ignore datetime -  ' + key + ':\n'
    if (isGeneratedColumn(queryName, key, definitions))
      return '\n # ignore generated -  ' + key + ':' + value + '\n'
    return key + ':' + value
  })

  return fieldsAndValues.join(',')
}

const noQuoteKeyStringify = (json) => {
  const isArray = Array.isArray(json)

  let result = isArray ? '[' : '{'
  Object.entries(json).forEach(([key, value]) => {
    let resultValue = value

    if (typeof value === 'string') resultValue = `${JSON.stringify(value)}`
    if (Array.isArray(value)) resultValue = noQuoteKeyStringify(value)
    else if (typeof value === 'object' && value !== null) resultValue = noQuoteKeyStringify(value)

    if (isArray) result += resultValue + ','
    else result += key + ':' + resultValue + ','
  })

  if (result.length > 1) result = result.slice(0, result.length - 1)

  return result + (isArray ? ']' : '}')
}

const generateMutations = ({ query, results }, definitions) => {
  const mutationName = getMutationNameFromQueryName(query.queryName)
  const recordName = getRecordNameFromQueryName(query.queryName)

  const mutations = results.map((record) => {
    const fieldsAndValues = getMutationFieldsAndValues(
      record,
      query.rawFields,
      query.queryName,
      definitions
    )

    let mutation = '\n########### ' + recordName + ' ' + record.id + ' ###########\n'
    mutation += `mutation { ${mutationName}(input: {${recordName}: {`
    mutation += fieldsAndValues
    mutation += '}}){clientMutationId}}'
    return { mutation, query, record, recordName }
  })
  return mutations
}

const getSummary = (mutations) => {
  const summary = {}

  mutations.forEach(({ recordName }) => {
    if (!summary[recordName]) summary[recordName] = 0
    summary[recordName]++
  })

  let summaryComment = '########### SUMMARY ###########\n'

  summaryComment += Object.entries(summary)
    .map(([recordName, count]) => '#   ' + recordName + '\n#     count :' + count)
    .join('\n')

  summaryComment += '\n########### MUTATIONS ###########\n'

  return summaryComment
}

const saveMutationsToFile = (mutations, snapshotFilename) => {
  let fileContent = getSummary(mutations) + '\n'
  fileContent += mutations.map(({ mutation }) => mutation).join('\n' + seperator + '\n')

  fs.writeFileSync(snapshotFilename, fileContent)
}

takeSnapshot(graphQLdefinition)
