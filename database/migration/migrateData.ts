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

    // Fix review_actions to only return active applications
    console.log(' - Fix review_actions to only return active applications')

    await DB.changeSchema(`
    CREATE OR REPLACE FUNCTION review_list (stageid int, reviewerid int)
    RETURNS TABLE (
        application_id int,
        reviewer_action public.reviewer_action
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        CASE WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'CHANGES_REQUESTED') != 0 THEN
            'UPDATE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'PENDING') != 0 THEN
            'RESTART_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'DRAFT'
            AND is_locked = FALSE) != 0 THEN
            'CONTINUE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            AND review_assignment.is_final_decision = TRUE
            AND review_assignment.is_last_stage = TRUE
            AND review = NULL) != 0 THEN
            'MAKE_DECISION'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            AND review.id IS NULL) != 0 THEN
            'START_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'AVAILABLE'
            AND is_self_assignable = TRUE
            AND (review = NULL
            OR is_locked = FALSE)) != 0 THEN
            'SELF_ASSIGN'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            OR review_status_history.status = 'SUBMITTED') != 0 THEN
            'VIEW_REVIEW'
        ELSE
            NULL
        END::public.reviewer_action
    FROM
        review_assignment
    LEFT JOIN review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
    WHERE
        review_assignment.stage_id = $1
        AND review_assignment.reviewer_id = $2
        AND (
            SELECT
                outcome
            FROM
                application
            WHERE
                id = review_assignment.application_id) = 'PENDING'
    GROUP BY
        review_assignment.application_id;
    $$
    LANGUAGE sql
    STABLE;
    `)

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

    // Renaming outcome tables to "data"
    console.log(' - Renaming data view tables')
    await DB.changeSchema(`
          ALTER TABLE outcome_display RENAME TO data_view;
          ALTER TABLE outcome_display_column_definition RENAME TO data_view_column_definition;
    `)

    // Common "data" table
    console.log(' - Creating DATA table')
    await DB.changeSchema(`
      CREATE TABLE data_table (
          id serial PRIMARY KEY,
          table_name varchar NOT NULL UNIQUE,
          display_name varchar,
          field_map jsonb,
          is_lookup_table boolean DEFAULT FALSE
      );
    `)

    console.log(' - Moving lookup table data to data table')
    const lookupTableData = await DB.getLookupTableData()
    if (lookupTableData) {
      for (const { name, label, field_map } of lookupTableData) {
        await DB.changeSchema(`ALTER TABLE lookup_table_${name} RENAME TO data_table_${name}`)
        await DB.insertDataTable(name, label, JSON.stringify(field_map), true)
      }
    }
    await DB.changeSchema(`DROP TABLE IF EXISTS lookup_table`)

    console.log('Done migrating on v0.2.0...')
  }

  // v0.3.1
  if (databaseVersionLessThan('0.3.1')) {
    console.log('Migrating to v0.3.1...')

    // Enforce code must be unique per template in template_action table
    console.log(' - Creating unique index for code/template in template_action')
    await DB.changeSchema(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_template_action_code
      ON template_action (code, template_id)
    `)

    console.log(' - Adding new trigger values ON_PREVIEW & ON_EXTEND')
    await DB.changeSchema(`
    ALTER TYPE public.trigger ADD VALUE IF NOT EXISTS
    'ON_PREVIEW' AFTER  'ON_SCHEDULE';
    ALTER TYPE public.trigger ADD VALUE IF NOT EXISTS
    'ON_EXTEND' AFTER  'ON_SCHEDULE';
    `)

    console.log(
      ' - Adding columns to file table: to_be_deleted, is_internal_reference_doc, is_external_reference_doc'
    )
    await DB.changeSchema(`
      ALTER TABLE file
      ADD COLUMN IF NOT EXISTS to_be_deleted boolean DEFAULT FALSE NOT NULL;
      ALTER TABLE file
      ADD COLUMN IF NOT EXISTS is_internal_reference_doc boolean DEFAULT FALSE NOT NULL;
      ALTER TABLE file
      ADD COLUMN IF NOT EXISTS is_external_reference_doc boolean DEFAULT FALSE NOT NULL;
    `)

    console.log(' - Adding function/trigger to delete unused reference docs')

    await DB.changeSchema(`
    CREATE OR REPLACE FUNCTION public.mark_file_for_deletion ()
    RETURNS TRIGGER AS $file_event$
    BEGIN
        UPDATE public.file
        SET to_be_deleted = TRUE
        WHERE id = NEW.id;
        RETURN NULL;
    END;
    $file_event$
    LANGUAGE plpgsql;

    CREATE TRIGGER file_no_longer_reference
      AFTER UPDATE ON public.file
      FOR EACH ROW
      WHEN (NEW.is_external_reference_doc = FALSE
        AND NEW.is_internal_reference_doc = FALSE
        AND (OLD.is_external_reference_doc = TRUE OR OLD.is_internal_reference_doc = TRUE))
      EXECUTE FUNCTION public.mark_file_for_deletion ();
    `)

    console.log(' - Adding reviewability fields to template_element')

    await DB.changeSchema(`
    CREATE TYPE public.is_reviewable_status AS ENUM (
      'ALWAYS',
      'NEVER' );`)

    await DB.changeSchema(`
      ALTER TABLE template_element
        ADD COLUMN IF NOT EXISTS is_reviewable public.is_reviewable_status DEFAULT NULL;
        `)
    // TO-DO: Add "review_required" column for optional reviews

    console.log(' - Adding function to revert outcomes')

    await DB.changeSchema(`
    CREATE OR REPLACE FUNCTION public.outcome_reverted ()
      RETURNS TRIGGER
      AS $application_event$
    BEGIN
      UPDATE public.application
      SET is_active = TRUE
      WHERE id = NEW.id;

      INSERT INTO public.application_status_history (application_stage_history_id, status)
          VALUES ((SELECT id FROM application_stage_history
                  WHERE application_id = NEW.id AND is_current = TRUE),
                  (SELECT status FROM application_status_history
                    WHERE time_created = (SELECT MAX(time_created)
                              FROM application_status_history
                              WHERE is_current = FALSE AND application_id = NEW.id)));
      RETURN NULL;
    END;
      $application_event$
      LANGUAGE plpgsql;
    `)

    await DB.changeSchema(`
      DROP TRIGGER IF EXISTS outcome_revert_trigger ON application;
      CREATE TRIGGER outcome_revert_trigger
        AFTER UPDATE OF outcome ON public.application
        FOR EACH ROW
        WHEN (NEW.outcome = 'PENDING' AND OLD.outcome <> 'PENDING')
        EXECUTE FUNCTION public.outcome_reverted ();
    `)

    console.log(' - Setting default timestamp on trigger_queue')

    await DB.changeSchema(`
      ALTER TABLE trigger_queue 
      ALTER COLUMN timestamp
      SET DEFAULT CURRENT_TIMESTAMP
    `)

    console.log(' - Adding applicant_deadline to application_list')

    await DB.changeSchema(`
      ALTER TABLE application_list_shape
      ADD COLUMN IF NOT EXISTS applicant_deadline timestamptz;
    `)

    await DB.changeSchema(`
      CREATE OR REPLACE FUNCTION application_list (userid int DEFAULT 0)
      RETURNS SETOF application_list_shape
      AS $$
      SELECT
          app.id,
          app.serial,
          app.name,
          template.code AS template_code,
          template.name AS template_name,
          CONCAT(first_name, ' ', last_name) AS applicant,
          org.name AS org_name,
          stage_status.stage,
          stage_status.stage_colour,
          stage_status.status,
          app.outcome,
          status_history_time_created AS last_active_date,
          (
              SELECT
                  time_scheduled
              FROM
                  trigger_schedule
              WHERE
                  application_id = app.id
                  AND is_active = TRUE) AS applicant_deadline,
          assigners,
          reviewers,
          reviewer_action,
          assigner_action,
          total_questions,
          total_assigned,
          total_assign_locked
      FROM
          application app
      LEFT JOIN TEMPLATE ON app.template_id = template.id
      LEFT JOIN "user" ON user_id = "user".id
      LEFT JOIN application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
      LEFT JOIN organisation org ON app.org_id = org.id
      LEFT JOIN assignment_list (stage_status.stage_id) ON app.id = assignment_list.application_id
      LEFT JOIN review_list (stage_status.stage_id, $1) ON app.id = review_list.application_id
      LEFT JOIN assigner_list (stage_status.stage_id, $1) ON app.id = assigner_list.application_id
        WHERE
            app.is_config = FALSE
        $$
        LANGUAGE sql
        STABLE;
    `)
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
