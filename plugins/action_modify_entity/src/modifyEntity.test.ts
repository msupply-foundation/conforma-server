// Test suite for the createUser Action -- just confirms that users are written to database.

import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { action as modifyEntity } from './index'

// User tests

const testUser = {
  first_name: 'Carl',
  last_name: 'Smith',
  username: 'ceejay',
  date_of_birth: '1999-12-23',
  password_hash: 'XYZ1234',
  email: 'test@sussol.net',
}

const invalidUser = {
  first_name: 'Carl',
  last_name: 'Smith',
  user_name: 'ceejay',
  dateOfBirth: '1999-12-23',
  password_hash: 'XYZ1234',
  email: 'test@sussol.net',
}

const updatedUser = {
  id: 2,
  email: 'carl@msupply.foundation',
}

test('Test: add User to database', () => {
  return modifyEntity({
    parameters: { tableName: 'user', ...testUser },
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        user: {
          id: 18,
          email: 'test@sussol.net',
          first_name: 'Carl',
          last_name: 'Smith',
          username: 'ceejay',
          password_hash: 'XYZ1234',
          date_of_birth: new Date('1999-12-22T11:00:00.000Z'),
        },
      },
    })
  })
})

test('Test: Invalid user (date_of_birth and username fields mis-named) -- should fail', () => {
  return modifyEntity({ parameters: { tableName: 'user', ...invalidUser }, DBConnect }).then(
    (result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Fail,
        error_log: 'column "user_name" of relation "user" does not exist',
      })
    }
  )
})

test('Test: Modify existing user', () => {
  return modifyEntity({
    parameters: { tableName: 'user', ...updatedUser },
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        user: {
          id: 2,
          email: 'carl@msupply.foundation',
          first_name: 'Carl',
          last_name: 'Smith',
          username: 'carl',
          password_hash: '$2a$10$3Z1cXVI.GzE9F2QYePzbMOg5CGtf6VnNKRiaiRGkzlBXJ0aiMN4JG',
          date_of_birth: null,
        },
      },
    })
  })
})

// Organisation Tests

const testOrg = {
  name: 'PharmaFarm',
  registration: 'AVC123',
  address: '123 Uptown Drive\nAuckland',
}

const testOrg2 = {
  name: 'Import This!',
}

test('Test: add Org to database', () => {
  return modifyEntity({ parameters: { tableName: 'organisation', ...testOrg }, DBConnect }).then(
    (result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          organisation: {
            id: 5,
            name: 'PharmaFarm',
            registration: 'AVC123',
            address: '123 Uptown Drive\nAuckland',
            logo_url: null,
          },
        },
      })
    }
  )
})

test('Test: add Org2 -- not all parameters provided', () => {
  return modifyEntity({ parameters: { tableName: 'organisation', ...testOrg2 }, DBConnect }).then(
    (result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          organisation: {
            id: 6,
            name: 'Import This!',
            registration: null,
            address: null,
            logo_url: null,
          },
        },
      })
    }
  )
})

test('Test: Update existing organisation', () => {
  return modifyEntity({
    parameters: { tableName: 'organisation', id: 1, registration: '123456789' },
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        organisation: {
          id: 1,
          name: 'Drugs-R-Us',
          registration: '123456789',
          address: '123 Nowhere St\nAuckland',
          logo_url: null,
        },
      },
    })
  })
})
