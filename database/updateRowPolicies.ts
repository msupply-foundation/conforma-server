import fetch from 'node-fetch'
import config from '../src/config'

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

export default updateRowPolicies
