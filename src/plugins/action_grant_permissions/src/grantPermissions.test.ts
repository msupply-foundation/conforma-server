// Test suite for the grantPermissions Action -- adds a permisison to valerio user to reviewCompanyRego
// Ideally would verify that logic works by checking db (permission_join table) before and after

import PostgresDB from '../../../components/databaseConnect'

const Action = require('./grantPermissions')

const testParams = {
  username: 'valerio',
  permissionNames: ['reviewCompanyRego'],
}

test('Test: Add permission to Valerio', () => {
  return Action.grantPermissions(testParams, PostgresDB).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
    })
  })
})
