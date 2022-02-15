import config from '../../src/config'
import DB from './databaseMethods'
import { AssignedSections } from './types'
import semverCompare from 'semver/functions/compare'

let { version } = config
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
    // Nothing version in database yet, so run all migration
    databaseVersion = '0.0.0'
  }

  // A specific database version can be provided when running manually
  if (isManualMigration && simulatedVersion) databaseVersion = simulatedVersion

  const databaseVersionLessThan = (version: string) =>
    semverCompare(databaseVersion, version) === -1

  // VERSION-SPECIFIC MIGRATION CODE BEGINS HERE

  // v0.2.0
  if (databaseVersionLessThan('0.2.0')) {
    console.log('Migrating to v0.2.0...')

    // Add "assigned_sections" column to schema
    try {
      await DB.addAssignedSectionsColumn()
    } catch (err) {
      console.log('Problem altering schema:', err.message, '\n')
      // Continue anyway, it's probably because schema change is already done
    }

    // Create missing "assigned sections" for existing review_assignments
    try {
      const reviewAssignments = await DB.getIncompleteReviewAssignments()
      const reviewAssignmentsWithSections: AssignedSections[] = []
      let currentReviewAssignment = { id: 0, assignedSections: new Set() }
      reviewAssignments.forEach((ra: any) => {
        if (ra.id === currentReviewAssignment.id)
          currentReviewAssignment.assignedSections.add(ra.code)
        else {
          if (currentReviewAssignment.id !== 0)
            reviewAssignmentsWithSections.push({
              id: currentReviewAssignment.id,
              assignedSections: [...currentReviewAssignment.assignedSections] as string[],
            })
          currentReviewAssignment = { id: ra.id, assignedSections: new Set([ra.code]) }
        }
      })
      // Don't forget about the last one
      reviewAssignmentsWithSections.push({
        id: currentReviewAssignment.id,
        assignedSections: [...currentReviewAssignment.assignedSections] as string[],
      })
      await DB.addAssignedSections(reviewAssignmentsWithSections)
    } catch (err) {
      throw err
    }
  }

  // Other version migrations continue here...

  // Finally, set the database version to the current version
  if (!isManualMigration) DB.setDatabaseVersion(version)
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
