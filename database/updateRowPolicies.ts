import fetch from 'node-fetch'
import { getAdminJWT } from '../src/components/permissions/loginHelpers'
import config from '../src/config'

async function updateRowPolicies() {
  console.log('updating row level policies ... ')

  const response = await fetch(`http://localhost:${config.RESTport}/api/admin/updateRowPolicies`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      authorization: `Bearer ${await getAdminJWT()}`,
    },
  })

  if (!response.ok) {
    return console.log('failed to update row level policies')
  }

  console.log('updating row level policies ... done')
}

export default updateRowPolicies
