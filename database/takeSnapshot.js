const fetch = require('node-fetch')
const fs = require('fs')
const rimraf = require('rimraf')
const { promisify } = require('util')
const graphQLendpoint = require('../src/config.json').graphQLendpoint
const { graphQLdefinition, defaultGenerateFileName } = require('./graphQLdefinitions.js')
const { execSync } = require('child_process')
const { executeGraphQLQuery } = require('./insertData.js')

const asyncRimraf = promisify(rimraf)
const snapshotNameFile = './database/snapshots/currentSnapshot.txt'

const takeSnapshot = async () => {
  let snapshotName = process.argv[2]
  const previousSnapshotName = fs.readFileSync(snapshotNameFile, 'utf-8')
  if (!snapshotName) snapshotName = previousSnapshotName
  fs.writeFileSync(snapshotNameFile, snapshotName)

  console.log('creating or updating snapshot: ', snapshotName)

  const snapshotFolder = 'database/snapshots/' + snapshotName

  console.log(previousSnapshotName, snapshotName, snapshotFolder)
  console.log('getting schema ...')
  const types = (await getSchema()).types
  console.log('getting schema ... done')

  console.log('creating queries ...')
  const tableNames = getTableNames(types)
  const inputTypes = getInputTypes(types, tableNames)
  const queries = getQueries(inputTypes)
  console.log('creating queries ... done')

  console.log('executing queries ...')
  const queryResultsAll = await Promise.all(queries.map((query) => getQueryData(query)))
  const queryResults = queryResultsAll.filter(({ results }) => results.length > 0)
  console.log('executing queries ... done')

  console.log('cleaning up snapshot folder ...')
  await cleanUpSnapshotFolder(snapshotFolder)
  console.log('cleaning up snapshot folder ... done')

  console.log('creating mutations ...')
  const mutations = queryResults.map((queryResult) => generateMutations(queryResult)).flat()
  console.log('creating mutations ... done')

  console.log('saving mutations to file ...')
  mutations.forEach((mutation) => saveMutationToFile(snapshotFolder, mutation))
  console.log('saving mutations to file ... done')

  console.log('prettifying mutations ...')
  execSync('yarn prettier --write "' + snapshotFolder + '/**/*.graphql"')
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

const getQueries = (inputTypes) => {
  const queries = inputTypes.map((type) => {
    const queryName = fromInputTypeToQueryType(type)
    const fields = type.inputFields
      .filter(
        (field) =>
          field.type.kind === 'SCALAR' ||
          field.type.kind === 'NON_NULL' ||
          field.type.kind === 'ENUM'
      )
      .map((field) => field.name)

    const query = `query { ${queryName} { nodes {${fields.join(',')}} } }`

    return { query, queryName, fields }
  })

  return queries
}

const getQueryData = async (query) => {
  const { query: gql, queryName } = query
  const json = await executeGraphQLQuery(gql)
  return { results: json.data[queryName].nodes, query }
}

const cleanUpSnapshotFolder = async (folder) => {
  if (fs.existsSync(folder)) {
    await asyncRimraf(folder)
  }
  fs.mkdirSync(folder)
}

const getRecordNameFromQueryName = (queryName) => {
  return toSingular(queryName)
}

const getMutationNameFromQueryName = (queryName) => {
  const queryNameSingular = getRecordNameFromQueryName(queryName)
  const queryNameCapitalised = queryNameSingular[0].toUpperCase() + queryNameSingular.slice(1)

  return 'create' + queryNameCapitalised
}

const getMutationFieldsAndValues = (record, queryFields) => {
  const fieldsAndValues = queryFields.map((field) => {
    let value = record[field]
    if (typeof record[field] === 'string') value = `${JSON.stringify(value)}`
    if (typeof record[field] === 'object' && record[field] !== null)
      value = noQuoteKeyStringify(value)

    return field + ':' + value
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

const generateMutations = ({ query, results }) => {
  const mutationName = getMutationNameFromQueryName(query.queryName)
  const recordName = getRecordNameFromQueryName(query.queryName)

  const mutations = results.map((record) => {
    const fieldsAndValues = getMutationFieldsAndValues(record, query.fields)
    let mutation = `mutation { ${mutationName}(input: {${recordName}: {`
    mutation += fieldsAndValues
    mutation += '}})}'
    return { mutation, query, record }
  })
  return mutations
}

const saveMutationToFile = (snapshotFolder, { mutation, query, record }) => {
  const tableName = getRecordNameFromQueryName(query.queryName)

  const tableDir = snapshotFolder + '/' + tableName

  if (!fs.existsSync(tableDir)) {
    fs.mkdirSync(tableDir)
  }

  const definition = graphQLdefinition.find((definition) => definition.table === tableName)
  if (definition?.skip) return
  const generateFilname =
    graphQLdefinition.find((definition) => definition.table === tableName)?.generateFileName ||
    defaultGenerateFileName
  const fileName = tableDir + '/' + generateFilname(record) + '.graphql'

  fs.writeFileSync(fileName, mutation)
}

takeSnapshot()
