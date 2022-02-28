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
    await DB.changeSchema(`
      CREATE TABLE public.system_info (
        id serial PRIMARY KEY,
        name varchar NOT NULL,
        value jsonb DEFAULT '{}',
        timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }

  // v0.2.0
  if (databaseVersionLessThan('0.2.0')) {
    console.log('Migrating to v0.2.0...')

    // Add "assigned_sections" column to schema
    await DB.changeSchema(`ALTER TABLE review_assignment
        ADD COLUMN assigned_sections varchar[] DEFAULT array[]::varchar[];`)

    // Update or create review_assignment assigned_sections Trigger/Function
    await DB.changeSchema(
      'DROP TRIGGER IF EXISTS review_assignment_trigger2 ON public.review_assignment'
    ) // CREATE OR REPLACE not working
    await DB.changeSchema('DROP FUNCTION unassign_review_without_sections')

    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.empty_assigned_sections () RETURNS TRIGGER AS $review_assignment_event$
        BEGIN
            UPDATE public.review_assignment SET assigned_sections = '{}'
            WHERE id = NEW.id;
            RETURN NULL;
        END;
        $review_assignment_event$
        LANGUAGE plpgsql;`)

    await DB.changeSchema(`CREATE TRIGGER review_assignment_trigger2
    AFTER UPDATE OF status ON public.review_assignment
    FOR EACH ROW WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.empty_assigned_sections ();`)

    // Update assigned questions function to remove review_question_assignments
    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level int)
    RETURNS bigint
    AS $$
    SELECT COUNT(DISTINCT (te.id))
    FROM (
            SELECT
                id,
                application_id,
                stage_id,
                level_number,
                status,
                UNNEST(assigned_sections) AS section_code
            FROM
                review_assignment) ra
        JOIN template_section ts ON ra.section_code = ts.code
        JOIN template_element te ON ts.id = te.section_id
    WHERE
        ra.application_id = $1
        AND ra.stage_id = $2
        AND ra.level_number = $3
        AND ra.status = 'ASSIGNED'
        AND te.category = 'QUESTION'
        AND te.template_code = (SELECT code FROM TEMPLATE
            WHERE id = (
                    SELECT template_id FROM application
                    WHERE id = $1));
    $$
    LANGUAGE sql
    STABLE;`)

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
      console.log(
        "Assigned sections couldn't be updated, presumably already done:",
        err.message,
        '\n'
      )
    }

    // DROP review_question_assignment and related views/fields
    await DB.changeSchema(`ALTER TABLE review_response
        DROP COLUMN review_question_assignment_id;`)
    await DB.changeSchema(`DROP VIEW IF EXISTS
      public.review_question_assignment_section;`)
    await DB.changeSchema(`DROP TABLE IF EXISTS
      public.review_question_assignment CASCADE;`)

    // Activity log - remove all references to review_question_assignment
    await DB.changeSchema(
      `CREATE OR REPLACE FUNCTION public.assignment_activity_log () RETURNS TRIGGER AS $application_event$ BEGIN INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details) VALUES ('ASSIGNMENT', ( CASE WHEN NEW.status = 'ASSIGNED' AND NEW.reviewer_id = NEW.assigner_id THEN 'Self-Assigned' WHEN NEW.status = 'ASSIGNED' AND NEW.reviewer_id <> NEW.assigner_id THEN 'Assigned' WHEN NEW.status = 'AVAILABLE' THEN 'Unassigned' ELSE 'ERROR' END), NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('status', NEW.status, 'reviewer', json_build_object('id', NEW.reviewer_id, 'name', ( SELECT full_name FROM "user" WHERE id = NEW.reviewer_id), 'orgId', NEW.organisation_id, 'orgName', ( SELECT name FROM organisation WHERE id = NEW.organisation_id)), 'assigner', json_build_object('id', NEW.assigner_id, 'name', ( SELECT full_name FROM "user" WHERE id = NEW.assigner_id)), 'stage', json_build_object('number', NEW.stage_number, 'name', ( SELECT title FROM template_stage WHERE id = NEW.stage_id)), 'sections', NEW.assigned_sections, 'reviewLevel', NEW.level_number)); RETURN NULL; END; $application_event$ LANGUAGE plpgsql;`
    )
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
