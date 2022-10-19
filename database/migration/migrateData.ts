import config from '../../src/config'
import DB from './databaseMethods'
import { ReviewAssignmentsWithSections } from './types'
import semverCompare from 'semver/functions/compare'
import semverInc from 'semver/functions/inc'
import { execSync } from 'child_process'
import path from 'path'
import { readFileSync } from 'fs'
import { getAppEntryPointDir } from '../../src/components/utilityFunctions'

// CONSTANTS
const FUNCTIONS_FILENAME = '43_views_functions_triggers.sql'
const INDEX_FILENAME = '44_index.sql'

const { version } = config
const isManualMigration: Boolean = process.argv[2] === '--migrate'
const simulatedVersion: string | undefined = process.argv[3]

const migrateData = async () => {
  let databaseVersion: string

  const appVersion =
    process.env.NODE_ENV === 'development'
      ? // In development, pretend the version is one higher than it is,
        // so we can keep getting changing migrations when testing
        semverInc(version, 'minor')
      : version

  try {
    databaseVersion = (await DB.getDatabaseVersion()).value
    // No migration if database version matches current version, but we still
    // proceed if this is a manual migration
    if (semverCompare(databaseVersion, appVersion) >= 0 && !isManualMigration) return
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
      `psql -U postgres -q -b -d tmf_app_manager -f "./database/buildSchema/39_activity_log.sql"`
    )

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

    console.log(' - Updating activity_log functions')

    await DB.changeSchema(`
      ALTER TYPE public.event_type ADD VALUE IF NOT EXISTS
      'EXTENSION' AFTER 'OUTCOME';
    `)
  }

  // v0.4.2
  if (databaseVersionLessThan('0.4.2')) {
    console.log('Migrating to v0.4.2...')
    console.log(' - Adding MANAGEMENT to UI Locations')

    await DB.changeSchema(`
      ALTER TYPE public.ui_location ADD VALUE IF NOT EXISTS
      'MANAGEMENT' AFTER 'ADMIN';
    `)
  }

  // v0.4.4
  if (databaseVersionLessThan('0.4.4')) {
    console.log('Migrating to v0.4.4...')
    console.log(' - Add "Optional if no response" option to "is_reviewable"')
    await DB.changeSchema(`
      ALTER TYPE public.is_reviewable_status ADD VALUE IF NOT EXISTS
      'OPTIONAL_IF_NO_RESPONSE' AFTER 'NEVER';
    `)

    // This change is really long, but there's no built-in way to drop values
    // from an ENUM. So we have to rename it, drop it and recreate it, as well
    // as drop and rebuild all the other objects that reference it 🙄

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
  }

  // 0.4.5
  if (databaseVersionLessThan('0.4.5')) {
    console.log('Migrating to v0.4.5...')
    // Add "is_latest_review" column to table review_response in schema
    console.log(' - Add is_latest_review to review_response with automatic trigger/update function')

    await DB.changeSchema(`ALTER TABLE review_response
        ADD COLUMN IF NOT EXISTS is_latest_review boolean DEFAULT FALSE;`)

    console.log(
      '- Update to Functions of Activity_log to fix problem with aggregation of assigned_section'
    )

    console.log(' - Add VIEW permission policy type')

    await DB.changeSchema(
      `ALTER TYPE permission_policy_type ADD VALUE IF NOT EXISTS 'VIEW' after 'ASSIGN'`
    )

    console.log(' - Add uniqueness constraint to user_org table')
    await DB.changeSchema(`
    ALTER TABLE user_organisation DROP CONSTRAINT IF EXISTS                     user_organisation_user_id_organisation_id_key;
    
    ALTER TABLE user_organisation ADD CONSTRAINT user_organisation_user_id_organisation_id_key UNIQUE (user_id, organisation_id);
    `)
  }

  // 0.4.6
  if (databaseVersionLessThan('0.4.6')) {
    console.log('Migrating to v0.4.6...')
    console.log(
      ' - Rename TYPE is_reviewable to reviewability and update field in TABLE template_element'
    )

    await DB.changeSchema(`
    ALTER TYPE public.is_reviewable_status RENAME TO reviewability;`)

    await DB.changeSchema(`
    ALTER TYPE public.reviewability
      ADD VALUE IF NOT EXISTS 'ONLY_IF_APPLICANT_ANSWER' AFTER 'NEVER';`)

    await DB.changeSchema(`
    ALTER TABLE public.template_element RENAME COLUMN is_reviewable TO reviewability;`)

    console.log(' - Remove 4 unused fields from application_list')
    await DB.changeSchema(
      `ALTER TABLE application_list_shape
        DROP COLUMN IF EXISTS total_questions;
      ALTER TABLE application_list_shape
        DROP COLUMN IF EXISTS total_assigned_submitted;
      ALTER TABLE application_list_shape
        DROP COLUMN IF EXISTS total_assigned;
      ALTER TABLE application_list_shape
        DROP COLUMN IF EXISTS total_assign_locked;`
    )

    console.log(
      ` - Update existing template_element where reviewability is set to NULL to use DEFAULT`
    )

    await DB.changeSchema(`
    UPDATE template_element te
      SET reviewability = 'ONLY_IF_APPLICANT_ANSWER'
      WHERE te.reviewability IS NULL;`)

    await DB.changeSchema(`
      ALTER TABLE public.template_element
        ALTER COLUMN reviewability
          SET NOT NULL,
        ALTER COLUMN reviewability
          SET DEFAULT 'ONLY_IF_APPLICANT_ANSWER';`)

    // Data view filtering
    console.log(' - Update data-view tables for filtering and sorting')
    await DB.changeSchema(`
      ALTER TABLE data_view
        DROP CONSTRAINT IF EXISTS outcome_display_table_name_code_key, 
        ADD COLUMN IF NOT EXISTS table_search_columns varchar[],
        ADD COLUMN IF NOT EXISTS filter_include_columns varchar[],
        ADD COLUMN IF NOT EXISTS filter_exclude_columns varchar[];
          
      ALTER TABLE data_view_column_definition 
        ADD COLUMN IF NOT EXISTS sort_column varchar,
        ADD COLUMN IF NOT EXISTS filter_parameters jsonb,
        ADD COLUMN IF NOT EXISTS filter_expression jsonb,
        ADD COLUMN IF NOT EXISTS filter_data_type varchar,
        ADD COLUMN IF NOT EXISTS sort_column varchar;
        
      ALTER TABLE data_view_column_definition 
        ADD COLUMN IF NOT EXISTS filter_parameters jsonb;`)

    console.log(' - Add timestamp and email_server_log to notification table')
    await DB.changeSchema(`
      ALTER TABLE notification 
        ADD COLUMN IF NOT EXISTS timestamp timestamptz
          DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ADD COLUMN IF NOT EXISTS email_server_log varchar; 
    `)

    console.log(
      ' - Change foreign key constraint on file table to allow changing of application serial'
    )
    await DB.changeSchema(`
      ALTER TABLE file DROP CONSTRAINT IF EXISTS file_application_serial_fkey; 
      ALTER TABLE file ADD CONSTRAINT file_application_serial_fkey FOREIGN KEY (application_serial) REFERENCES application (serial) ON UPDATE CASCADE;
      `)
  }
  // Other version migrations continue here...

  // Update (almost all) Indexes, Views, Functions, Triggers regardless, since
  // they can be dropped and recreated, or updated with no consequence:
  const functionsScript = readFileSync(
    path.join(getAppEntryPointDir(), '../database/buildSchema/', FUNCTIONS_FILENAME),
    'utf-8'
  )
  console.log(' - Updating views/functions/triggers')
  await DB.changeSchema(functionsScript)

  const createIndexesScript = readFileSync(
    path.join(getAppEntryPointDir(), '../database/buildSchema/', INDEX_FILENAME),
    'utf-8'
  )
  console.log(' - Updating indexes...')
  await DB.changeSchema(createIndexesScript)

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
