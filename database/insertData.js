const fs = require('fs')
const fetch = require('node-fetch')
const config = require('../src/config.json')

if (process.argv[2] === '--from_insert_data.sh') {
  const filesToProcess = fs
    .readdirSync('./database/insertData')
    .filter((file) => !file.match(/^\./)) // Ignore hidden files
    .filter((file) => !['core_mutations.js', 'dev_actions.js'].includes(file))

  processQueries(filesToProcess)
}

async function processQueries(filesToProcess) {
  for (const file of filesToProcess) {
    const { queries } = require(`./insertData/${file}`)
    console.log(`  -- ${file}`)
    for (const query of queries) {
      await executeGraphQLQuery(query)
    }
  }
}

async function executeGraphQLQuery(query) {
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
    console.log(JSON.stringify(response.errors, null, '  '))
    process.exit(0)
  }

  return response
}

exports.executeGraphQLQuery = executeGraphQLQuery
