import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import config from '../src/config.json'
import { getAppEntryPointDir } from '../src/components/utilityFunctions'

const dataFolder = path.join(getAppEntryPointDir(), config.databaseFolder, 'insertData')

const filterFile =
  (includeInsertScripts: string[] = [], excludeInsertScripts: string[] = []) =>
  (file: fs.Dirent) => {
    if (!file.isFile()) return
    const fileName = file.name
    if (fileName.match(/^\./)) return false

    const isFileInclude =
      includeInsertScripts.length === 0 || includeInsertScripts.includes(fileName)
    const isFileExclude = excludeInsertScripts.includes(fileName)
    return isFileInclude && !isFileExclude
  }

async function insertQueries(
  localeFolder: string,
  includeInsertScripts: string[] = [],
  excludeInsertScripts: string[] = []
) {
  const filesToProcess = fs
    .readdirSync(path.join(dataFolder, '_common'), { encoding: 'utf-8', withFileTypes: true })
    .filter(filterFile(includeInsertScripts, excludeInsertScripts))
    .map((dirent) => path.join('_common', dirent.name))

  // Add locale-specific files

  console.log(`Locale: ${localeFolder}`)
  const subfolderFilesToProcess = fs
    .readdirSync(path.join(dataFolder, localeFolder), { encoding: 'utf-8', withFileTypes: true })
    .filter(filterFile(includeInsertScripts, excludeInsertScripts))

  filesToProcess.push(
    ...subfolderFilesToProcess.map((dirent) => path.join(localeFolder, dirent.name))
  )

  console.log('filesToProcess', filesToProcess)

  await processQueries(filesToProcess)
}

async function processQueries(filesToProcess: string[]) {
  for (const file of filesToProcess) {
    const { queries } = require(path.join(dataFolder, file))
    console.log(`  -- ${file}`)
    for (const query of queries) {
      if (query instanceof Object) await executeGraphQLQuery(query.query, query.variables)
      else await executeGraphQLQuery(query)
    }
  }
}

async function executeGraphQLQuery(query: any, variables: any = {}) {
  const res = await fetch(config.graphQLendpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })
  const response = await res.json()
  if (response.errors) {
    console.log(JSON.stringify(response.errors, null, '  '))
    process.exit(0)
  }

  return response
}

export default insertQueries
