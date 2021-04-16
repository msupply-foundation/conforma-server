// Test suite for the createUser Action -- just confirms that users are written to database.

import DBConnect from '../../../src/components/databaseConnect'
import { action as createOrg } from './index'

const testOrg = {
  name: 'PharmaFarm',
  licence_number: 'AVC123',
  address: '123 Uptown Drive\nAuckland',
}

const testOrg2 = {
  name: 'Import This!',
}

const invalidOrg = {
  name: 'PharmaFarm',
  licenceNumber: 'AVC123',
  address: '123 Uptown Drive\nAuckland',
}

test('Test: add Org to database', () => {
  return createOrg(testOrg, DBConnect).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        orgId: 5,
        orgName: 'PharmaFarm',
      },
    })
  })
})

test('Test: add Org2 -- not all parameters provided', () => {
  return createOrg(testOrg2, DBConnect).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        orgId: 6,
        orgName: 'Import This!',
      },
    })
  })
})

test('Test: Invalid user (date_of_birth and username fields mis-named) -- should fail', () => {
  return createOrg(invalidOrg, DBConnect).then((result: any) => {
    expect(result).toEqual({
      status: 'Fail',
      error_log: 'There was a problem creating new organisation.',
    })
  })
})
