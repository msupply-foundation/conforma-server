// Test suite for the modifyRecord Action -- just confirms that users are written to database.

import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionApplicationData } from '../../../src/types'
import { action as modifyRecord } from './index'

// User tests

const testUser = {
  first_name: 'Carl',
  last_name: 'Smith',
  username: 'ceejay2',
  date_of_birth: '1999-12-23',
  password_hash: 'XYZ1234',
  email: 'test@sussol.net',
}

const testUser2 = {
  first_name: 'Carl',
  last_name: 'Smith',
  user_name: 'ceejay',
  dateOfBirth: '1999-12-23',
  password_hash: 'XYZ1234',
  email: 'test@sussol.net',
}

const updatedUser = {
  id: 3,
  email: 'carl@msupply.foundation',
}

const updatedUserByUsername = {
  username: 'js',
  email: 'john@msupply.foundation',
}

const updatedUserByUsername2 = {
  username: 'johnny_smith',
  first_name: 'Johnny',
}

const extraParameters = {
  DBConnect,
  applicationData: { applicationId: 4000 } as ActionApplicationData,
}

test('Test: add User to database', () => {
  return modifyRecord({
    parameters: { tableName: 'user', ...testUser },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        user: {
          id: 19,
          email: 'test@sussol.net',
          first_name: 'Carl',
          last_name: 'Smith',
          full_name: 'Carl Smith',
          username: 'ceejay2',
          password_hash: 'XYZ1234',
          date_of_birth: new Date('1999-12-22T11:00:00.000Z'),
        },
      },
    })
  })
})

test('Test: Modify existing user', () => {
  return modifyRecord({
    parameters: { tableName: 'user', ...updatedUser },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        user: {
          id: 3,
          email: 'carl@msupply.foundation',
          first_name: 'Carl',
          last_name: 'Smith',
          full_name: 'Carl Smith',
          username: 'carl',
          password_hash: '$2a$10$3Z1cXVI.GzE9F2QYePzbMOg5CGtf6VnNKRiaiRGkzlBXJ0aiMN4JG',
          date_of_birth: null,
        },
      },
    })
  })
})

test('Test: Modify existing user using username', () => {
  return modifyRecord({
    parameters: { tableName: 'user', matchField: 'username', ...updatedUserByUsername },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        user: {
          id: 4,
          email: 'john@msupply.foundation',
          first_name: 'John',
          last_name: 'Smith',
          full_name: 'John Smith',
          username: 'js',
          password_hash: '$2a$10$ne2WcPISMw/Do3JzlwThYeO2GcodrumjI3FwGu1ZUoKgRQyAgNS3e',
          date_of_birth: null,
        },
      },
    })
  })
})

test('Test: Change username by matching username', () => {
  return modifyRecord({
    parameters: {
      tableName: 'user',
      matchField: 'username',
      matchValue: 'js',
      ...updatedUserByUsername2,
    },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        user: {
          id: 4,
          email: 'john@msupply.foundation',
          first_name: 'Johnny',
          last_name: 'Smith',
          full_name: 'Johnny Smith',
          username: 'johnny_smith',
          password_hash: '$2a$10$ne2WcPISMw/Do3JzlwThYeO2GcodrumjI3FwGu1ZUoKgRQyAgNS3e',
          date_of_birth: null,
        },
      },
    })
  })
})

test('Test: creating new field on user "dateOfBirth"', () => {
  return modifyRecord({
    parameters: { tableName: 'user', ...testUser2 },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      error_log: '',
      output: {
        user: {
          id: 20,
          dateOfBirth: '1999-12-22',
          date_of_birth: null,
          email: 'test@sussol.net',
          first_name: 'Carl',
          last_name: 'Smith',
          full_name: 'Carl Smith',
          password_hash: 'XYZ1234',
          user_name: 'ceejay',
          username: null,
        },
      },
      status: ActionQueueStatus.Success,
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
  return modifyRecord({
    parameters: { tableName: 'organisation', ...testOrg },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        organisation: {
          id: 5,
          is_system_org: false,
          name: 'PharmaFarm',
          registration: 'AVC123',
          address: '123 Uptown Drive\nAuckland',
          logo_url: null,
        },
      },
    })
  })
})

test('Test: add Org2 -- not all parameters provided', () => {
  return modifyRecord({
    parameters: { tableName: 'organisation', ...testOrg2 },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        organisation: {
          id: 6,
          is_system_org: false,
          name: 'Import This!',
          registration: null,
          address: null,
          logo_url: null,
        },
      },
    })
  })
})

test('Test: Update existing organisation', () => {
  return modifyRecord({
    parameters: { tableName: 'organisation', id: 1, registration: '123456789' },
    ...extraParameters,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        organisation: {
          id: 1,
          is_system_org: false,
          name: 'Drugs-R-Us',
          registration: '123456789',
          address: '123 Nowhere St\nAuckland',
          logo_url: null,
        },
      },
    })
  })
})

test('Test: Check creating of application join record', () => {
  return modifyRecord({
    parameters: { tableName: 'user', username: 'new', email: 'new@new.com' },
    ...extraParameters,
  }).then(async (result: any) => {
    const queryResult = await DBConnect.query({
      text: 'SELECT * from user_application_join where user_id = $1',
      values: [result.output.user.id],
    })

    expect(queryResult.rows).toEqual([{ application_id: 4000, id: 6, user_id: 21 }])
  })
})
