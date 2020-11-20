// Test suite for the createUser Action -- just confirms that users are written to database.

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
