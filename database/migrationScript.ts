import DBConnect from '../src/components/databaseConnect'
import config from '../src/config'

// Script for updating existing data after a new version includes schema changes

const { version } = config

const migrationScript = () => {
  console.log('config', config)
  if (version === 'dev') {
    console.log(
      'In dev mode -- no migration by default (Run `yarn migrate` to manually upgrade database)'
    )
    return
  }
  console.log('Migrating data')

  // v b2.0.0
}

if (process.argv[2] === '--migrate') {
  console.log("We're migrating")
  migrationScript()
}

export default migrationScript
