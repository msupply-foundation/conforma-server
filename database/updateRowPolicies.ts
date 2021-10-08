import fetch from 'node-fetch'
import config from '../src/config'
import { sign } from 'jsonwebtoken'
import { promisify } from 'util'
import { baseJWT } from '../src/components/permissions/rowLevelPolicyHelpers'

const signPromise: any = promisify(sign)

const getAdminJWT = async () => {
  return await signPromise({ ...baseJWT, isAdmin: true, role: 'postgres' }, config.jwtSecret)
}

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
  process.exit(0)
}

export default updateRowPolicies
