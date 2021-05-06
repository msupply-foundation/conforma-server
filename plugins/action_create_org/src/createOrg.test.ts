// Test suite for the createUser Action -- just confirms that users are written to database.

import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { action as createOrg } from './index'

const testOrg = {
  name: 'PharmaFarm',
  registration: 'AVC123',
  address: '123 Uptown Drive\nAuckland',
}

const testOrg2 = {
  name: 'Import This!',
}

const invalidOrg = {
  name: 'PharmaFarm',
  registration: 'AVC123',
  address: '123 Uptown Drive\nAuckland',
}

test('Test: add Org to database', () => {
  return createOrg({ parameters: testOrg, DBConnect }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        orgId: 5,
        orgName: 'PharmaFarm',
      },
    })
  })
})

test('Test: add Org2 -- not all parameters provided', () => {
  return createOrg({ parameters: testOrg2, DBConnect }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        orgId: 6,
        orgName: 'Import This!',
      },
    })
  })
})

test('Test: Invalid user (date_of_birth and username fields mis-named) -- should fail', () => {
  return createOrg({ parameters: invalidOrg, DBConnect }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem creating new organisation.',
    })
  })
})
