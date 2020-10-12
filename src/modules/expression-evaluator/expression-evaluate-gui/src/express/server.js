const express = require('express')
const app = express()
const port = 3001
const cors = require('cors')
const config = require('../config.json')

const { Client } = require('pg')
const { text } = require('express')
const client = new Client(config.pg_database_connection)

client.connect()

app.use(cors())

app.get('/test', (req, res) => {
  res.send({ body: 'This is a test' })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/pg-query', (req, res) => {
  const { text, values, rowMode } = req.query
  const valuesArray = values ? values.split(',') : []
  // console.log('Query', text)
  // console.log('Values', valuesArray)
  // console.log('RowMode', rowMode)
  client
    .query({
      text: text,
      values: valuesArray,
      rowMode: rowMode ? rowMode : '',
    })
    .then((result) => {
      res.send(result)
    })
})
