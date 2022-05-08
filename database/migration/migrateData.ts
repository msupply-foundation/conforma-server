import config from '../../src/config'
import DB from './databaseMethods'
import { ReviewAssignmentsWithSections } from './types'
import semverCompare from 'semver/functions/compare'
import { execSync } from 'child_process'

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
    console.log(' - Add system_info TABLE')

    await DB.changeSchema(`
      CREATE TABLE public.system_info (
        id serial PRIMARY KEY,
        name varchar NOT NULL,
        value jsonb DEFAULT '{}',
        timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Done migrating on v0.1.0...')
  }

  // v0.2.0
  if (databaseVersionLessThan('0.2.0')) {
    console.log('Migrating to v0.2.0...')

    // Add "assigned_sections" column to schema
    console.log(' - Add review_assignment TABLE field: assigned_sections')

    await DB.changeSchema(`ALTER TABLE review_assignment
        ADD COLUMN assigned_sections varchar[] DEFAULT array[]::varchar[];`)

    // Update or create review_assignment assigned_sections Trigger/Function
    console.log(' - Add review_assignment_trigger2 TRIGGER field: assigned_sections')
    await DB.changeSchema(
      'DROP TRIGGER IF EXISTS review_assignment_trigger2 ON public.review_assignment'
    ) // CREATE OR REPLACE not working
    await DB.changeSchema('DROP FUNCTION unassign_review_without_sections')

    console.log(' - Update empty_assigned_sections FUNCTION: count using assigned_sections')
    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.empty_assigned_sections () RETURNS TRIGGER AS $review_assignment_event$
        BEGIN
            UPDATE public.review_assignment SET assigned_sections = '{}'
            WHERE id = NEW.id;
            RETURN NULL;
        END;
        $review_assignment_event$
        LANGUAGE plpgsql;`)

    console.log(
      ' - Update review_assignment_trigger2 TRIGGER: set empty assigned_sections based on status'
    )

    await DB.changeSchema(`CREATE TRIGGER review_assignment_trigger2
    AFTER UPDATE OF status ON public.review_assignment
    FOR EACH ROW WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.empty_assigned_sections ();`)

    // Update function to count assigned questions
    console.log(' - Update assigned_questions_count FUNCTION: count using assigned_sections')
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

    console.log(
      ' - Update submitted_assigned_questions_count FUNCTION: count using assigned_sections'
    )

    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.submitted_assigned_questions_count (app_id int, stage_id int, level_number int) RETURNS bigint AS $$
    SELECT COUNT(DISTINCT (te.id))
    FROM (SELECT id, application_id, stage_id, level_number, status,
            UNNEST(assigned_sections) AS section_code
        FROM review_assignment) ra
    JOIN template_section ts ON ra.section_code = ts.code
    JOIN template_element te ON ts.id = te.section_id
    LEFT JOIN review ON review.review_assignment_id = ra.id
    LEFT JOIN review_status_history rsh ON rsh.review_id = review.id
  WHERE
    ra.application_id = $1
    AND ra.stage_id = $2
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
    AND te.category = 'QUESTION'
    AND rsh.status = 'SUBMITTED'
    AND te.template_code = (
        SELECT code FROM TEMPLATE
        WHERE id = (
          SELECT template_id FROM application
          WHERE id = $1))
    $$
    LANGUAGE sql
    STABLE;`)

    // Create missing "assigned sections" for existing review_assignments
    console.log(' - Update field in review_assignments TABLE: assigned_sections')

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
    console.log(' - Remove column in review_reponse TABLE: review_question_assignment_id')
    await DB.changeSchema(`ALTER TABLE review_response
        DROP COLUMN review_question_assignment_id;`)

    console.log(' - Remove review_question_assignment_section VIEW')
    await DB.changeSchema(`DROP VIEW IF EXISTS
      public.review_question_assignment_section;`)

    console.log(' - Remove review_question_assignment TABLE and linked records...')
    await DB.changeSchema(`DROP TABLE IF EXISTS
      public.review_question_assignment CASCADE;`)

    // Run whole activity log build script from scratch
    await execSync(
      `psql -U postgres -q -b -d tmf_app_manager -f "./database/buildSchema/45_activity_log.sql"`
    )

    // Update function to generate template_element_id for review_response
    console.log(
      ' - Update set_original_response FUNCTION generated field: template_element_id (from review_response)'
    )
    await DB.changeSchema(
      `CREATE OR REPLACE FUNCTION set_original_response () RETURNS TRIGGER AS $$ BEGIN IF NEW.review_response_link_id IS NOT NULL THEN NEW.original_review_response_id = (
        SELECT original_review_response_id 
        FROM review_response 
        WHERE id = NEW.review_response_link_id);
      NEW.application_response_id = (
        SELECT application_response_id 
        FROM review_response 
        WHERE id = NEW.review_response_link_id);
      ELSE NEW.original_review_response_id = NEW.id;
      END IF;
      -- application_response should always exist
      NEW.template_element_id = (
        SELECT template_element_id 
        FROM application_response 
        WHERE id = NEW.application_response_id);
      RETURN NEW; END;
      $$ LANGUAGE plpgsql;`
    )

    // New field description returned in permissions_all
    console.log(' - Add permission_all VIEW field: description')

    await DB.changeSchema(`
    DROP VIEW IF EXISTS permissions_all;
    CREATE OR REPLACE VIEW permissions_all AS (
    SELECT
        "user".username AS "username",
        organisation.name AS "orgName",
        "template".code AS "templateCode",
        permission_name.name AS "permissionName",
        permission_name.description AS "description",
        template_permission.stage_number AS "stageNumber",
        template_permission.level_number AS "reviewLevel",
        template_permission.allowed_sections AS "allowedSections",
        template_permission.can_self_assign AS "canSelfAssign",
        template_permission.can_make_final_decision AS "canMakeFinalDecision",
        template_permission.restrictions AS "restrictions",
        permission_policy.name AS "policyName",
        permission_policy.type AS "permissionType",
        permission_policy.is_admin AS "isAdmin",
        permission_policy.id AS "permissionPolicyId",
        permission_policy.rules AS "permissionPolicyRules",
        permission_name.id AS "permissionNameId",
        template_permission.id AS "templatePermissionId",
        "template".id AS "templateId",
        "user".id AS "userId",
        permission_join.id AS "permissionJoinId",
        permission_join.organisation_id AS "orgId",
        CASE WHEN template_category.ui_location @> (ARRAY['USER']::public.ui_location[]) THEN
            TRUE
        ELSE
            FALSE
        END AS "isUserCategory",
        permission_name.is_system_org_permission AS "isSystemOrgPermission",
        permission_join.is_active AS "isActive"
    FROM
        permission_name
        LEFT JOIN permission_join ON permission_join.permission_name_id = permission_name.id
        JOIN permission_policy ON permission_policy.id = permission_name.permission_policy_id
        LEFT JOIN "user" ON permission_join.user_id = "user".id
        LEFT JOIN organisation ON permission_join.organisation_id = organisation.id
        LEFT JOIN template_permission ON template_permission.permission_name_id = permission_name.id
        LEFT JOIN "template" ON "template".id = template_permission.template_id
        LEFT JOIN template_category ON "template".template_category_id = template_category.id);`)

    // Update pg_notify functions to not include possibly too-large payload data
    console.log(' - Updating pg_notify functions for triggers')

    await DB.changeSchema(`
      CREATE OR REPLACE FUNCTION public.notify_trigger_queue ()
      RETURNS TRIGGER
      AS $trigger_event$
        BEGIN
            PERFORM
                pg_notify('trigger_notifications', json_build_object('trigger_id', NEW.id, 'trigger', NEW.trigger_type, 'table', NEW.table, 'record_id', NEW.record_id, 'event_code', NEW.event_code)::text);
            RETURN NULL;
        END;
        $trigger_event$
        LANGUAGE plpgsql;`)

    await DB.changeSchema(`
        CREATE OR REPLACE FUNCTION public.notify_action_queue ()
        RETURNS TRIGGER
        AS $action_event$
        BEGIN
            -- IF NEW.status = 'QUEUED' THEN
            PERFORM
                pg_notify('action_notifications', json_build_object('id', NEW.id, 'code', NEW.action_code, 'condition_expression', NEW.condition_expression, 'parameter_queries', NEW.parameter_queries)::text);
            -- END IF;
            RETURN NULL;
        END;
        $action_event$
        LANGUAGE plpgsql;`)

    console.log('Done migrating on v0.2.0...')
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
