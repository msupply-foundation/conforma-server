import config from '../../src/config'
import DB from './databaseMethods'
import { AssignedSections } from './types'
import semverInc from 'semver/functions/inc'
import semverCompare from 'semver/functions/compare'

let { version } = config
let isManualMigration: Boolean = process.argv[2] === '--migrate'

const migrateData = async () => {
  let databaseVersion: string
  try {
    databaseVersion = (await DB.getDatabaseVersion()).value
    // No migration
    if (semverCompare(databaseVersion, version) >= 0) return
  } catch (err) {
    // Nothing version in database yet, so run all migration
    databaseVersion = '0.0.0'
  }

  // When running manually, we want to temporarily bump the current version so
  // the latest migration changes will run
  if (isManualMigration) version = semverInc(version, 'patch')

  // v0.2.0
  if (semverCompare(databaseVersion, '0.2.0') === -1) {
    // Add "assigned_sections" column to schema

    // Rebuild "assigned sections" for existing review_assignments
    console.log('Migrating to v0.2.0...')
    try {
      const reviewAssignments = await DB.getIncompleteReviewAssignments()
      const reviewAssignmentsWithSections: AssignedSections[] = []
      reviewAssignments.forEach((ra: any) => {
        const assignedSections = new Set()
        ra.reviewQuestionAssignments.nodes.forEach((rqa: any) =>
          assignedSections.add(rqa.templateElement.section.code)
        )
        reviewAssignmentsWithSections.push({
          id: ra.id,
          assignedSections: [...assignedSections] as string[],
        })
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

if (isManualMigration) {
  // For running migrationScript.ts manually using `yarn migrate`
  console.log('Running migration script...')
  migrateData().then(() => {
    console.log('Done!\n')
    process.exit(0)
  })
}

export default migrateData
