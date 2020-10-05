import PostgresDB from '../../../components/postgresConnect'

module.exports['createUser'] = function (parameters: any) {
  try {
    console.log('\nAdding new user...')

    return {
      status: 'Success',
      error_log: '',
    }
  } catch (error) {
    return {
      status: 'Fail',
      error_log: 'There was a problem creating new user.',
    }
  }
}
