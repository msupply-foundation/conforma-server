const fetch = require('node-fetch')
const config = require('../src/config.json')

if (process.argv[2] === '--from_insert_data.sh') updateRowPolicies()

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

exports.updateRowPolicies = updateRowPolicies
