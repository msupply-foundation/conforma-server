const fs = require('fs')
const fetch = require('node-fetch')

const config = require('../src/config.json')

const graphQLendpoint = config.graphQLendpoint

const filesToProcess = fs.readdirSync('./database/insertData').filter((file) => !file.match(/^\./)) // Ignore hidden files

processQueries(filesToProcess)

async function processQueries(filesToProcess) {
  for (const file of filesToProcess) {
    const { queries } = require(`./insertData/${file}`)
    console.log(`  -- ${file}`)
    for (const query of queries) {
      await executeGraphQLQuery(query)
    }
  }
  console.log('\nUpdating Row Policies...')
  await updateRowPolicies()
}

async function executeGraphQLQuery(query) {
  const res = await fetch(graphQLendpoint, {
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
}

async function updateRowPolicies() {
  await fetch(`http://localhost:${config.RESTport}/updateRowPolicies`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })
}
