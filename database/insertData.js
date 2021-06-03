const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const config = require('../src/config.json')

const dataFolder = './database/insertData'
const sharedDataFiles = ['core_mutations.js', 'dev_actions.js']

if (process.argv[2] === '--from_insert_data.sh') {
  const filesToProcess = fs
    .readdirSync(dataFolder, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .filter((file) => !file.match(/^\./)) // Ignore hidden files
    .filter((file) => !sharedDataFiles.includes(file))

  // Add locale-specific files
  const localeFolder = process.argv[3] || 'dev'
  if (localeFolder) {
    console.log(`Locale: ${localeFolder}`)
    const subfolderFilesToProcess = fs
      .readdirSync(path.join(dataFolder, localeFolder))
      .filter((file) => !file.match(/^\./)) // Ignore hidden files
      .filter((file) => !sharedDataFiles.includes(file))
    filesToProcess.push(
      ...subfolderFilesToProcess.map((filename) => path.join(localeFolder, filename))
    )
    // Copy current version of core mutations/actions to subfolder
    sharedDataFiles.forEach((file) =>
      fs.copyFileSync(path.join(dataFolder, file), path.join(dataFolder, localeFolder, file))
    )
  }

  processQueries(filesToProcess)
}

async function processQueries(filesToProcess) {
  for (const file of filesToProcess) {
    const { queries } = require(`./insertData/${file}`)
    console.log(`  -- ${file}`)
    for (const query of queries) {
      if (query instanceof Object) await executeGraphQLQuery(query.query, query.variables)
      else await executeGraphQLQuery(query)
    }
  }
}

async function executeGraphQLQuery(query, variables = {}) {
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

exports.executeGraphQLQuery = executeGraphQLQuery
