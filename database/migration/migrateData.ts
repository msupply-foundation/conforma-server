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

    await DB.changeSchema(` CREATE OR REPLACE FUNCTION public.empty_assigned_sections () RETURNS TRIGGER AS $review_assignment_event$
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

    // Also add trigger/function to delete question assignments
    // - First add section code to review_question_assignments
    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.rqa_template_section_code (template_element_id int)
      RETURNS varchar AS $$
    SELECT code FROM template_section
    WHERE id = ( SELECT section_id FROM template_element WHERE id = $1);
    $$
    LANGUAGE SQL
    IMMUTABLE;`)

    await DB.changeSchema(`ALTER TABLE review_question_assignment ADD COLUMN
      section_code varchar GENERATED ALWAYS AS (public.rqa_template_section_code (template_element_id)) STORED`)

    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.delete_question_assignments ()
        RETURNS TRIGGER
        AS $review_question_assignment_event$
    BEGIN
        IF NEW.assigned_sections <> '{}' THEN
            DELETE FROM public.review_question_assignment
            WHERE review_assignment_id = NEW.id
                AND NOT section_code = ANY (ARRAY ((SELECT assigned_sections
                  FROM review_assignment ra WHERE id = NEW.id)));
            ELSEIF NEW.status = 'AVAILABLE' THEN
            DELETE FROM public.review_question_assignment
            WHERE review_assignment_id = NEW.id;
        END IF;
        RETURN NULL;
    END;
    $review_question_assignment_event$
    LANGUAGE plpgsql;`)

    await DB.changeSchema(`CREATE TRIGGER review_question_assignment_trigger
    AFTER UPDATE OF assigned_sections ON public.review_assignment
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_question_assignments ();`)

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
