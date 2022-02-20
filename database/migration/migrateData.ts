import config from '../../src/config'
import DB from './databaseMethods'
import { ReviewAssignmentsWithSections } from './types'
import semverCompare from 'semver/functions/compare'

const { version } = config
const isManualMigration: Boolean = process.argv[2] === '--migrate'
const simulatedVersion: string | undefined = process.argv[3]

const migrateData = async () => {
  let databaseVersion: string

  try {
    databaseVersion = (await DB.getDatabaseVersion()).value
    // No migration if database version matches current version, but we still
    // proceed if this is a manual migration
    if (semverCompare(databaseVersion, version) >= 0 && !isManualMigration) return
  } catch (err) {
    // No version in database yet, so run all migration
    databaseVersion = '0.0.0'
  }

  // A specific database version can be provided when running manually
  if (isManualMigration && simulatedVersion) databaseVersion = simulatedVersion

  // Comparison function using semver parser
  const databaseVersionLessThan = (version: string) =>
    semverCompare(databaseVersion, version) === -1

  // VERSION-SPECIFIC MIGRATION CODE BEGINS HERE

  // v0.1.0
  if (databaseVersionLessThan('0.1.0')) {
    console.log('Migrating to 0.1.0...')
    // Create "system_info" table
    try {
      await DB.rawQuery(`
      CREATE TABLE public.system_info (
        id serial PRIMARY KEY,
        name varchar NOT NULL,
        value jsonb DEFAULT '{}',
        timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `)
    } catch (err) {
      console.log('Problem altering schema:', err.message, '\n')
      // Continue anyway, it's probably because schema change is already done
    }
  }

  // v0.2.0
  if (databaseVersionLessThan('0.2.0')) {
    console.log('Migrating to v0.2.0...')

    // Add "assigned_sections" column to schema
    try {
      await DB.rawQuery(`ALTER TABLE review_assignment
        ADD COLUMN assigned_sections varchar[] DEFAULT array[]::varchar[];`)
    } catch (err) {
      console.log('Problem altering schema:', err.message, '\n')
      // Continue anyway, it's probably because schema change is already done
    }

    // Create missing "assigned sections" for existing review_assignments
    try {
      const reviewAssignments = await DB.getIncompleteReviewAssignments()
      const reviewAssignmentsWithSections: ReviewAssignmentsWithSections = {}

      reviewAssignments.forEach((ra: any) => {
        const idKey = String(ra.id)
        if (!reviewAssignmentsWithSections[idKey]) reviewAssignmentsWithSections[idKey] = new Set()
        reviewAssignmentsWithSections[idKey].add(ra.code)
      })

      await DB.addAssignedSections(
        Object.entries(reviewAssignmentsWithSections).map(([idKey, assignedSections]) => ({
          id: Number(idKey),
          assignedSections: [...assignedSections],
        }))
      )
    } catch (err) {
      throw err
    }
  }

  // Other version migrations continue here...

  // Finally, set the database version to the current version
  if (databaseVersionLessThan(version)) await DB.setDatabaseVersion(version)
}

// For running migrationScript.ts manually using `yarn migrate`
if (isManualMigration) {
  console.log('Running migration script...')
  migrateData().then(() => {
    console.log('Done!\n')
    process.exit(0)
  })
}

export default migrateData
