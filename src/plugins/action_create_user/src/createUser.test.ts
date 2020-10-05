// Test suite for the createUser Action -- just confirms that users are written to database.

const Action = require('./createUser')

const testUser = {
  first_name: 'Carl',
  last_name: 'Smith',
  username: 'ceejay',
  // date_of_birth: '1999-12-23',
  password_hash: 'XYZ1234',
  email: 'test@sussol.net',
}

// Action.createUser(testUser)

// test('Test: add User to database', () => {
//   expect(Action.createUser(testUser)).toEqual({
//     status: 'Success',
//     error_log: '',
//   })
// })

test('Test: add User to database', () => {
  return Action.createUser(testUser).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
    })
  })
})
