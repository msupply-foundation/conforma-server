import config from '../../src/config'
import DB from './databaseMethods'
import { compare } from 'compare-versions'

// Script for updating existing data after a new version includes schema changes

const { version } = config

const migrationScript = async () => {
  let databaseVersion: string
  try {
    databaseVersion = (await DB.getDatabaseVersion()).value
    if (compare(databaseVersion, version, '>=')) return
  } catch (err) {
    throw err
  }

  if (compare(databaseVersion, '0.2.0', '<')) {
    // Upgrade to 0.2.0
    console.log("We'll need to upgrade!")
  }

  // Finally, set the database version to the current version
  DB.setDatabaseVersion(version)
}

if (process.argv[2] === '--migrate') {
  // For running migrationScript.ts manually using `yarn migrate`
  migrationScript()
}

export default migrationScript
