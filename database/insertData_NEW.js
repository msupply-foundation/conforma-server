const fs = require('fs')
const fetch = require('node-fetch')

const config = require('../src/config.json')

const graphQLendpoint = config.graphQLendpoint

const filesToProcess = fs.readdirSync('./database/insertData').filter((file) => !file.match(/^\./))

processQueries(filesToProcess)

async function processQueries(filesToProcess) {
  for (const file of filesToProcess) {
    const { queries } = require(`./insertData/${file}`)
    console.log(`Inserting ${file} into database...`)
    for (const query of queries) {
      await executeGraphQLQuery(query)
    }
  }
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
  const data = await res.json()
}
