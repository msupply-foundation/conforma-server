// Test suite for the grantPermissions Action -- adds a permisison to valerio user to reviewCompanyRego
// Ideally would verify that logic works by checking db (permission_join table) before and after

import PostgresDB from '../../../src/components/databaseConnect'
import { action as grantPermissions } from './index'

const testParams = {
  username: 'valerio',
  permissionNames: ['reviewCompanyRego'],
}

const testParams2 = {
  username: 'carl',
  orgName: 'Medicinal Importers, Ltd.',
  permissionNames: ['reviewCompanyRego'],
}

test('Test: Add permission to Valerio', () => {
  return grantPermissions(testParams, PostgresDB).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      output: {
        permissionJoinIds: [24],
        permissionNames: ['reviewCompanyRego'],
      },
      error_log: '',
    })
  })
})

// Run the test twice to show that result doesn't change even if record already exists
test('Test: Add permission to Valerio, already exists', () => {
  return grantPermissions(testParams, PostgresDB).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      output: {
        permissionJoinIds: [24],
        permissionNames: ['reviewCompanyRego'],
      },
      error_log: '',
    })
  })
})

// Include an Organisation
test('Test: Add permission to Carl and Medicinal Importers, Ltd.', () => {
  return grantPermissions(testParams2, PostgresDB).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      output: {
        permissionJoinIds: [26],
        permissionNames: ['reviewCompanyRego'],
      },
      error_log: '',
    })
  })
})

// Repeat insert, as above
test('Test: Add permission to Carl and Medicinal Importers, Ltd., already exists', () => {
  return grantPermissions(testParams2, PostgresDB).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      output: {
        permissionJoinIds: [26],
        permissionNames: ['reviewCompanyRego'],
      },
      error_log: '',
    })
  })
})
