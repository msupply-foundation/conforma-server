const config = require('../src/config.json')
const fetch = require('node-fetch')
const fs = require('fs')

async function executeGraphQLQuery(query, exitOnFailure = true) {
  const res = await fetch(config.graphQLendpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  })
  const response = await res.json()
  if (response.errors) {
    const errorMessage = JSON.stringify(response.errors, null, '  ')
    if(exitOnFailure){ 
      console.log(errorMessage)
      process.exit(0)
    } 
    throw new Error(errorMessage)
  }

  return response
}

async function updateRowPolicies() {
  console.log('updating row level policies ... ')

  await fetch(`http://localhost:${config.RESTport}/updateRowPolicies`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  console.log('updating row level policies ... done')
}

async function insertCoreData(filesToIgnore = []) {
  const filesToProcess = fs
    .readdirSync('./database/insertData')
    .filter((file) => !file.match(/^\./)) // Ignore hidden files
    .filter((file) => !['core_actions.js', 'dev_actions.js', ...filesToIgnore].includes(file))

  for (const file of filesToProcess) {
    const { queries } = require(`./insertData/${file}`)
    console.log(`  -- ${file}`)
    for (const query of queries) {
      await executeGraphQLQuery(query)
    }
  }
}

exports.executeGraphQLQuery = executeGraphQLQuery
exports.updateRowPolicies = updateRowPolicies
exports.insertCoreData = insertCoreData
