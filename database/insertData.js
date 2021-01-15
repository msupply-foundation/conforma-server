const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

const config = require('../src/config.json')

const graphQLendpoint = config.graphQLendpoint

const filesToProcess = fs.readdirSync('./database/insertData').filter((file) => !file.match(/^\./))
console.log(filesToProcess)

filesToProcess.forEach((file) => {
  const queries = require(`./insertData/${file}`)
})

const loopQueries = async () => {
  for (let i = 0; i < queries.length; i++) {
    const res = await fetch(graphQLendpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: queries[i],
      }),
    })
    const data = await res.json()
    console.log('Added to database:', JSON.stringify(data))
  }
}

loopQueries()

const runQuery = async (query) => {
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
