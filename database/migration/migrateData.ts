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
      ALTER TABLE application 
      ALTER COLUMN outcome
      SET DEFAULT 'PENDING';
    `)

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
      SET DEFAULT CURRENT_TIMESTAMP;
    `)

    console.log(' - Making scheduled time on trigger_schedule non-nullable')

    await DB.changeSchema(`
      ALTER TABLE trigger_schedule
      ALTER COLUMN time_scheduled
      SET NOT NULL;
    `)

    console.log(' - Adding "COMPLETED" status to trigger_queue enum')

    await DB.changeSchema(`
      ALTER TYPE public.trigger_queue_status ADD VALUE IF NOT EXISTS
      'COMPLETED' AFTER  'ERROR';
    `)

    console.log(' - Add "user_id" field to trigger_schedule to track user who made changes')

    await DB.changeSchema(`
      ALTER TABLE trigger_schedule
      ADD COLUMN editor_user_id integer REFERENCES public.user (id) ON DELETE CASCADE;
    `)

    console.log(' - Adding applicant_deadline to application_list')

    // We need to drop and re-create the application_list_shape table so the
    // column order gets preserved, otherwise the subsequent application_list
    // function will fail
    await DB.changeSchema(`
      DROP TABLE IF EXISTS application_list_shape CASCADE;
    `)

    await DB.changeSchema(`
      CREATE TABLE application_list_shape (
        id int,
        "serial" varchar,
        "name" varchar,
        template_code varchar,
        template_name varchar,
        applicant varchar,
        org_name varchar,
        stage varchar,
        stage_colour varchar,
        "status" public.application_status,
        outcome public.application_outcome,
        last_active_date timestamptz,
        applicant_deadline timestamptz,
        -- TO-DO: reviewer_deadline
        assigners varchar[],
        reviewers varchar[],
        reviewer_action public.reviewer_action,
        assigner_action public.assigner_action,
        -- is_fully_assigned_level_1 boolean,
        -- assigned_questions_level_1 bigint,
        total_questions bigint,
        total_assigned bigint,
        total_assign_locked bigint
    );
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
          ts.time_scheduled AS applicant_deadline,
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
      LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
        AND ts.is_active = TRUE
        AND ts.event_code = 'applicantDeadline'
      WHERE
          app.is_config = FALSE
        $$
        LANGUAGE sql
        STABLE;
    `)
    // Required to make 'orderBy' work in application_list
    // Need to use psql as node-pg doesn't handle the comment command
    execSync(
      `psql -U postgres -d tmf_app_manager -c "COMMENT ON FUNCTION application_list (userid int) IS E'@sortable';"`
    )

    console.log(' - Updating activity_log functions')

    await DB.changeSchema(`
      ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS
      'EXTENSION' AFTER 'OUTCOME';
    `)
    // Scheduled event (deadline) changes
    await DB.changeSchema(`
      CREATE OR REPLACE FUNCTION public.deadline_extension_activity_log ()
      RETURNS TRIGGER
      AS $application_event$
      BEGIN
          INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
              VALUES ('EXTENSION', NEW.event_code, NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('newDeadline', NEW.time_scheduled, 'extendedBy', json_build_object('userId', NEW.editor_user_id, 'name', (
                SELECT full_name FROM "user"
                WHERE id = NEW.editor_user_id))));
          RETURN NULL;
      END;
      $application_event$
      LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS deadline_extension_activity_trigger ON public.application;

      CREATE TRIGGER deadline_extension_activity_trigger
          AFTER UPDATE ON public.trigger_schedule
          FOR EACH ROW
          WHEN (NEW.time_scheduled > OLD.time_scheduled AND NEW.event_code = 'applicantDeadline' AND NEW.editor_user_id IS NOT NULL)
          EXECUTE FUNCTION deadline_extension_activity_log ();
    `)
  }

  // v0.4.2
  if (databaseVersionLessThan('0.4.2')) {
    console.log(' - Adding MANAGEMENT to UI Locations')

    await DB.changeSchema(`
      ALTER TYPE public.ui_location ADD VALUE IF NOT EXISTS
      'MANAGEMENT' AFTER 'ADMIN';
    `)
  }

  // v0.4.4
  if (databaseVersionLessThan('0.4.4')) {
    console.log(' - Add "Optional if no response" option to "is_reviewable"')
    await DB.changeSchema(`
      ALTER TYPE public.is_reviewable_status ADD VALUE IF NOT EXISTS
      'OPTIONAL_IF_NO_RESPONSE' AFTER 'NEVER';
    `)

    console.log(' - Removes Trigger values: ON_REVIEW_REASSIGN and ON_REVIEW_SELF_ASSIGN')

    // This step seperate as it'll fail if the type has already been redefined
    await DB.changeSchema(`
      UPDATE template_action SET trigger='ON_REVIEW_ASSIGN'
        WHERE trigger='ON_REVIEW_REASSIGN' OR trigger='ON_REVIEW_SELF_ASSIGN';	
    `)

    await DB.changeSchema(`
      ALTER TYPE public.trigger RENAME to trigger_old;

      CREATE TYPE public.trigger AS ENUM
      (
        'ON_APPLICATION_CREATE',
        'ON_APPLICATION_RESTART',
        'ON_APPLICATION_SUBMIT',
        'ON_APPLICATION_SAVE',
        'ON_APPLICATION_WITHDRAW',
        'ON_REVIEW_CREATE',
        'ON_REVIEW_SUBMIT',
        'ON_REVIEW_RESTART',
        'ON_REVIEW_ASSIGN',
        'ON_REVIEW_UNASSIGN',
        'ON_APPROVAL_SUBMIT',
        'ON_VERIFICATION',
        'ON_SCHEDULE',
        'ON_PREVIEW',
        'ON_EXTEND',
        'DEV_TEST',
        'PROCESSING',
        'ERROR'
      );

      ALTER TABLE trigger_queue
        ALTER COLUMN trigger_type TYPE public.trigger
        USING trigger_type::text::public.trigger;    
        
      ALTER TABLE template_action
        ALTER COLUMN trigger TYPE public.trigger
        USING trigger::text::public.trigger;

      DROP TRIGGER IF EXISTS application_trigger ON application;

      ALTER TABLE application
          ALTER COLUMN TRIGGER TYPE public.trigger
          USING TRIGGER::text::public.trigger;
      
      CREATE TRIGGER application_trigger
          AFTER INSERT OR UPDATE OF trigger ON public.application
          FOR EACH ROW
          WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
          EXECUTE FUNCTION public.add_event_to_trigger_queue ();
      
      DROP TRIGGER IF EXISTS trigger_schedule_trigger ON trigger_schedule;
      
      ALTER TABLE trigger_schedule
          ALTER COLUMN TRIGGER TYPE public.trigger
          USING TRIGGER::text::public.trigger;
      
      CREATE TRIGGER trigger_schedule_trigger
          AFTER INSERT OR UPDATE OF trigger ON public.trigger_schedule
          FOR EACH ROW
          WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
          EXECUTE FUNCTION public.add_event_to_trigger_queue ();
      
      DROP TRIGGER IF EXISTS review_assignment_trigger ON review_assignment;
      
      ALTER TABLE review_assignment
          ALTER COLUMN TRIGGER TYPE public.trigger
          USING TRIGGER::text::public.trigger;
      
      CREATE TRIGGER review_assignment_trigger
          AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
          FOR EACH ROW
          WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
          EXECUTE FUNCTION public.add_event_to_trigger_queue ();
      
      DROP TRIGGER IF EXISTS review_trigger ON review;
      
      ALTER TABLE review
          ALTER COLUMN TRIGGER TYPE public.trigger
          USING TRIGGER::text::public.trigger;
      
      CREATE TRIGGER review_trigger
          AFTER INSERT OR UPDATE OF trigger ON public.review
          FOR EACH ROW
          WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
          EXECUTE FUNCTION public.add_event_to_trigger_queue ();
      
      DROP TRIGGER IF EXISTS verification_trigger ON verification;
      
      ALTER TABLE verification
          ALTER COLUMN TRIGGER TYPE public.trigger
          USING TRIGGER::text::public.trigger;
      
      CREATE TRIGGER verification_trigger
          AFTER INSERT OR UPDATE OF trigger ON public.verification
          FOR EACH ROW
          WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
          EXECUTE FUNCTION public.add_event_to_trigger_queue ();
      
      DROP TYPE public.trigger_old;    
    `)

    console.log(' - Adding AWAITING_RESPONSE action to reviewer_action')

    await DB.changeSchema(`
      ALTER TYPE public.reviewer_action ADD VALUE IF NOT EXISTS
      'AWAITING_RESPONSE' AFTER 'UPDATE_REVIEW';
    `)

    console.log(' - Update function review_list to return action AWAITING_RESPONSE')

    await DB.changeSchema(`
      CREATE OR REPLACE FUNCTION review_list (stageid int, reviewerid int, appstatus public.application_status)
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
              WHEN COUNT(*) FILTER (WHERE (appstatus = 'CHANGES_REQUIRED'
                  OR appstatus = 'DRAFT') 
                  AND review_assignment.status = 'ASSIGNED'
                  AND review_status_history.status = 'SUBMITTED') != 0 THEN
                  'AWAITING_RESPONSE'
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

    console.log(
      ' - Update function application_list to pass along stage_status to review_list function'
    )
    await DB.changeSchema(`CREATE OR REPLACE FUNCTION application_list (userid int DEFAULT 0)
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
            ts.time_scheduled AS applicant_deadline,
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
        LEFT JOIN review_list (stage_status.stage_id, $1, stage_status.status) ON app.id = review_list.application_id
        LEFT JOIN assigner_list (stage_status.stage_id, $1) ON app.id = assigner_list.application_id
        LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
            AND ts.is_active = TRUE
            AND ts.event_code = 'applicantDeadline'
    WHERE
        app.is_config = FALSE
  $$
  LANGUAGE sql
  STABLE;`)
  }

  // 0.4.5
  if (databaseVersionLessThan('0.4.5')) {
    // Add "is_latest_review" column to table review_response in schema
    console.log(' - Add is_latest_review to review_response with automatic trigger/update function')

    await DB.changeSchema(`ALTER TABLE review_response
        ADD COLUMN IF NOT EXISTS is_latest_review boolean DEFAULT FALSE;`)

    await DB.changeSchema(`CREATE OR REPLACE FUNCTION public.set_latest_review_response ()
        RETURNS TRIGGER
        AS $review_response_event$
    BEGIN
        UPDATE
            public.review_response
        SET
            is_latest_review = TRUE
        WHERE
            id = NEW.id;
        UPDATE
            public.review_response
        SET
            is_latest_review = FALSE
        WHERE
            template_element_id = NEW.template_element_id
            AND review_id = NEW.review_id
            AND id <> NEW.id;
        RETURN NULL;
    END;
    $review_response_event$
    LANGUAGE plpgsql;
    `)

    await DB.changeSchema(`
      DROP TRIGGER IF EXISTS review_response_latest ON review_response;
    `)

    await DB.changeSchema(`CREATE TRIGGER review_response_latest
      AFTER UPDATE OF time_updated ON public.review_response
      FOR EACH ROW
      WHEN (NEW.time_updated > OLD.time_created)
      EXECUTE FUNCTION public.set_latest_review_response ();
      `)

    console.log(
      '- Update to Functions of Activity_log to fix problem with aggregation of assigned_section'
    )

    await DB.changeSchema(`
    -- REVIEW STATUS CHANGES
    CREATE OR REPLACE FUNCTION public.review_status_activity_log ()
        RETURNS TRIGGER
        AS $application_event$
    DECLARE
        app_id integer;
        reviewer_id integer;
        assignment_id integer;
        stage_number integer;
        prev_status varchar;
        level_num integer;
        is_last_level boolean;
        is_final_decision boolean;
        templ_id integer;
    BEGIN
        SELECT
            r.application_id,
            r.reviewer_id,
            r.review_assignment_id,
            r.stage_number,
            r.level_number,
            r.is_last_level,
            r.is_final_decision INTO app_id,
            reviewer_id,
            assignment_id,
            stage_number,
            level_num,
            is_last_level,
            is_final_decision
        FROM
            review r
        WHERE
            id = NEW.review_id;
        templ_id = (
            SELECT
                template_id
            FROM
                application
            WHERE
                id = app_id);
        prev_status = (
            SELECT
                status
            FROM
                review_status_history
            WHERE
                review_id = NEW.review_id
                AND is_current = TRUE);
        INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
            VALUES ('REVIEW', NEW.status, app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status, 'reviewId', NEW.review_id, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                            SELECT
                                full_name
                            FROM "user"
                            WHERE
                                id = reviewer_id), 'stage', json_build_object('number', stage_number, 'name', (
                                    SELECT
                                        title
                                    FROM public.template_stage
                                    WHERE
                                        number = stage_number
                                        AND template_id = templ_id))), 'sections', (
                                SELECT
                                    json_agg(t)
                                FROM (
                                    SELECT
                                        title, code, "index"
                                    FROM template_section
                                WHERE
                                    code = ANY (ARRAY (
                                            SELECT
                                                assigned_sections
                                            FROM review_assignment
                                        WHERE
                                            id = assignment_id
                                            AND template_id = templ_id
                                            AND assigned_sections <> '{}'))
                                    AND template_id = templ_id ORDER BY "index") t), 'level', level_num, 'isLastLevel', is_last_level, 'finalDecision', is_final_decision));
        RETURN NEW;
    END;
    $application_event$
    LANGUAGE plpgsql;
      `)

    DB.changeSchema(`
    -- REVIEW_DECISION changes
    CREATE OR REPLACE FUNCTION public.review_decision_activity_log ()
        RETURNS TRIGGER
        AS $application_event$
    DECLARE
        app_id integer;
        reviewer_id integer;
        rev_assignment_id integer;
        templ_id integer;
    BEGIN
        SELECT
            r.application_id,
            r.reviewer_id,
            r.review_assignment_id INTO app_id,
            reviewer_id,
            rev_assignment_id
        FROM
            review r
        WHERE
            id = NEW.review_id;
        templ_id = (
            SELECT
                template_id
            FROM
                application
            WHERE
                id = app_id);
        INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
            VALUES ('REVIEW_DECISION', NEW.decision, app_id, TG_TABLE_NAME, NEW.id, json_build_object('reviewId', NEW.review_id, 'decision', NEW.decision, 'comment', NEW.comment, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                            SELECT
                                full_name
                            FROM "user"
                            WHERE
                                id = reviewer_id)), 'sections', (
                            SELECT
                                json_agg(t)
                            FROM (
                                SELECT
                                    title, code, "index"
                                FROM template_section
                                WHERE
                                    code = ANY (ARRAY (
                                            SELECT
                                                assigned_sections
                                            FROM review_assignment
                                        WHERE
                                            id = rev_assignment_id
                                            AND assigned_sections <> '{}'))
                                    AND template_id = templ_id ORDER BY "index") t)));
        RETURN NULL;
    END;
    $application_event$
    LANGUAGE plpgsql;
      `)

    console.log('- Add VIEW permission policy type')

    await DB.changeSchema(
      `ALTER TYPE permission_policy_type ADD VALUE IF NOT EXISTS 'VIEW' after 'ASSIGN'`
    )

    console.log(' - Remove uniqueness constraint from data_view table')
    await DB.changeSchema(`
      ALTER TABLE data_view DROP CONSTRAINT IF EXISTS outcome_display_table_name_code_key; 
    `)

    console.log(' - Updating functions to retrieve reviewable vs assigned questions')
    await DB.changeSchema(
      `-- Function to return elements reviewable questions (per application)
      DROP FUNCTION public.reviewable_questions;
      CREATE OR REPLACE FUNCTION public.reviewable_questions (app_id int)
        RETURNS TABLE (
            code varchar,
            response_id int,
            is_reviewable public.is_reviewable_status,
            response_value jsonb,
            is_optional boolean
        )
        AS $$
        SELECT DISTINCT ON (code)
            te.code AS code,
            ar.id AS response_id,
            te.is_reviewable AS is_reviewable,
            ar.value AS response_value,
            CASE WHEN ar.value IS NULL
                AND te.is_reviewable = 'OPTIONAL_IF_NO_RESPONSE' THEN
                TRUE
            ELSE
                FALSE
            END::boolean
        FROM
            application_response ar
            JOIN application app ON ar.application_id = app.id
            JOIN template_element te ON ar.template_element_id = te.id
        WHERE
            ar.application_id = $1
            AND te.category = 'QUESTION'
            AND ((ar.value IS NULL
                  AND te.is_reviewable = 'OPTIONAL_IF_NO_RESPONSE')
              OR (ar.value IS NOT NULL
                  AND te.is_reviewable != 'NEVER'))
        GROUP BY
            te.code,
            ar.time_submitted,
            ar.id,
            te,
            is_reviewable,
            ar.value
        ORDER BY
            code,
            ar.time_submitted DESC
    $$
    LANGUAGE sql
    STABLE;`
    )

    await DB.changeSchema(
      `-- Function to return elements of assigned questions for current stage/level
      DROP FUNCTION public.assigned_questions;
      CREATE OR REPLACE FUNCTION public.assigned_questions (app_id int, stage_id int, level_number int)
        RETURNS TABLE (
            review_id int,
            response_id int,
            review_assignment_id int,
            review_response_code varchar,
            review_response_status public.review_response_status,
            decision public.review_response_decision,
            is_optional boolean,
            is_lastest_review boolean
        )
        AS $$
        SELECT DISTINCT ON (review_response_code)
            rr.review_id,
            rq.response_id,
            ra.id AS review_assignment_id,
            rq.code AS review_response_code,
            rr.status AS review_response_status,
            rr.decision,
            rq.is_optional,
            rr.is_latest_review
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
        JOIN reviewable_questions (app_id) rq ON rq.code = te.code
        JOIN review ON review.review_assignment_id = ra.id
        JOIN review_response rr ON (rr.application_response_id = rq.response_id
                AND rr.review_id = review.id)
    WHERE
        ra.application_id = $1
        AND ra.stage_id = $2
        AND ra.level_number = $3
        AND ra.status = 'ASSIGNED'
    GROUP BY
        ra.id,
        rr.review_id,
        rr.is_latest_review,
        rq.is_optional,
        rr.status,
        rr.decision,
        rq.code,
        rq.response_id
      ORDER BY
          review_response_code,
          is_latest_review DESC
    $$
    LANGUAGE sql
    STABLE;`
    )

    await DB.changeSchema(
      `-- Function to return TOTAL of reviewable questions (per application)
      CREATE OR REPLACE FUNCTION public.reviewable_questions_count (app_id int)
          RETURNS bigint
          AS $$
          SELECT
              COUNT(*)
          FROM
              reviewable_questions (app_id)
      $$
      LANGUAGE sql
      STABLE;`
    )

    await DB.changeSchema(
      `-- Function to return TOTAL assigned questions for current stage/level
      CREATE OR REPLACE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level int)
          RETURNS bigint
          AS $$
          SELECT
              COUNT(*)
          FROM
              assigned_questions (app_id, stage_id, level)
      $$
      LANGUAGE sql
      STABLE;`
    )

    await DB.changeSchema(
      `-- Function to return TOTAL of assigned and submitted (element that can't be re-assigned)
      CREATE OR REPLACE FUNCTION public.submitted_assigned_questions_count (app_id int, stage_id int, level_number int)
          RETURNS bigint
          AS $$
          SELECT
              COUNT(*)
          FROM
              assigned_questions (app_id, stage_id, level_number) aq 
              where aq.review_response_status = 'SUBMITTED'
      $$
      LANGUAGE sql
      STABLE;`
    )

    await DB.changeSchema(
      `DROP FUNCTION assigner_list;
      CREATE OR REPLACE FUNCTION assigner_list (stage_id int, assigner_id int)
        RETURNS TABLE (
            application_id int,
            assigner_action public.assigner_action,
            reviewable_questions bigint,
            total_questions bigint,
            total_assigned_submitted bigint,
            total_assigned bigint,
            total_assign_locked bigint
        )
        AS $$
        SELECT
            review_assignment.application_id AS application_id,
            CASE WHEN COUNT(DISTINCT (review_assignment.id)) != 0
                AND assigned_questions_count (application_id, $1, level_number) >= reviewable_questions_count (application_id)
                AND submitted_assigned_questions_count (application_id, $1, level_number) < assigned_questions_count (application_id, $1, level_number) THEN
                'RE_ASSIGN'
            WHEN COUNT(DISTINCT (review_assignment.id)) != 0
                AND assigned_questions_count (application_id, $1, level_number) >= reviewable_questions_count (application_id)
                AND submitted_assigned_questions_count (application_id, $1, level_number) >= assigned_questions_count (application_id, $1, level_number) THEN
                'ASSIGN_LOCKED'
            WHEN COUNT(DISTINCT (review_assignment.id)) != 0
                AND assigned_questions_count (application_id, $1, level_number) < reviewable_questions_count (application_id) THEN
                'ASSIGN'
            ELSE
                NULL
            END::assigner_action,
            reviewable_questions_count (application_id) AS reviewable_questions,
            reviewable_questions_count (application_id) AS total_questions,
            submitted_assigned_questions_count (application_id, $1, level_number) AS total_assigned_submitted,
            assigned_questions_count (application_id, $1, level_number) AS total_assigned,
            submitted_assigned_questions_count (application_id, $1, level_number) AS total_assign_locked
        FROM
            review_assignment
        LEFT JOIN review_assignment_assigner_join ON review_assignment.id = review_assignment_assigner_join.review_assignment_id
      WHERE
        review_assignment.stage_id = $1
        AND review_assignment_assigner_join.assigner_id = $2
        AND (
            SELECT
                outcome
            FROM
                application
            WHERE
                id = review_assignment.application_id) = 'PENDING'
        GROUP BY
            review_assignment.application_id,
            review_assignment.level_number;
        $$
        LANGUAGE sql
        STABLE;`
    )

    console.log(' - Add extra returned field reviewable_questions in application_list')
    await DB.changeSchema(
      `ALTER TABLE application_list_shape 
        ADD COLUMN IF NOT EXISTS reviewable_questions bigint;
      ALTER TABLE application_list_shape
        DROP COLUMN IF EXISTS total_assign_locked;`
    )

    await DB.changeSchema(
      `CREATE OR REPLACE FUNCTION application_list (userid int DEFAULT 0)
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
            ts.time_scheduled AS applicant_deadline,
            assigners,
            reviewers,
            reviewer_action,
            assigner_action,
            reviewable_questions,
            total_questions,
            total_assigned
        FROM
            application app
        LEFT JOIN TEMPLATE ON app.template_id = template.id
        LEFT JOIN "user" ON user_id = "user".id
        LEFT JOIN application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
        LEFT JOIN organisation org ON app.org_id = org.id
        LEFT JOIN assignment_list (stage_status.stage_id) ON app.id = assignment_list.application_id
        LEFT JOIN review_list (stage_status.stage_id, $1, stage_status.status) ON app.id = review_list.application_id
        LEFT JOIN assigner_list (stage_status.stage_id, $1) ON app.id = assigner_list.application_id
        LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
            AND ts.is_active = TRUE
            AND ts.event_code = 'applicantDeadline'
    WHERE
        app.is_config = FALSE
    $$
    LANGUAGE sql
    STABLE;`
    )

    console.log(' - Convert default for template_element.is_reviewable to ONLY_IF_APPLICANT_ANSWER')

    await DB.changeSchema(`
    ALTER TYPE public.is_reviewable_status ADD VALUE IF NOT EXISTS
    'ONLY_IF_APPLICANT_ANSWER' AFTER  'NEVER';`)

    await DB.changeSchema(`
      ALTER TABLE public.template_element 
        ALTER COLUMN is_reviewable
        SET DEFAULT 'ONLY_IF_APPLICANT_ANSWER';`)

    await DB.changeSchema(`
    UPDATE template_element te SET is_reviewable = 'ONLY_IF_APPLICANT_ANSWER'
      WHERE te.is_reviewable IS NULL
        AND te.category = 'QUESTION'`)
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
