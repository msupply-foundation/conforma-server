SET check_function_bodies = FALSE;

--
-- Name: jwt_get_text(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_text (jwt_key text)
  RETURNS text
  AS $$
  SELECT
    COALESCE(current_setting('jwt.claims.' || $1, TRUE)::text, '')
$$
LANGUAGE sql
STABLE;

--
-- Name: jwt_get_boolean(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_boolean (jwt_key text)
  RETURNS boolean
  AS $$
BEGIN
  IF jwt_get_text ($1) = 'true' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$
LANGUAGE plpgsql
STABLE;

--
-- Name: jwt_get_bigint(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_bigint (jwt_key text)
  RETURNS bigint
  AS $$
BEGIN
  IF jwt_get_text ($1) = '' THEN
    RETURN 0;
  ELSE
    RETURN jwt_get_text ($1)::bigint;
  END IF;
END;
$$
LANGUAGE plpgsql
STABLE;

-- user table
CREATE TABLE public.user (
    id serial PRIMARY KEY,
    first_name varchar,
    last_name varchar,
    full_name varchar GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    username varchar UNIQUE,
    email varchar,
    date_of_birth date,
    password_hash varchar
);

-- organisation table
CREATE TABLE public.organisation (
    id serial PRIMARY KEY,
    name varchar UNIQUE,
    registration varchar UNIQUE,
    address varchar,
    logo_url varchar,
    is_system_org boolean DEFAULT FALSE
);

-- user_organisation table
CREATE TABLE public.user_organisation (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE NOT NULL,
    user_role varchar
);

-- VIEW table to show users with their organisations
CREATE OR REPLACE VIEW user_org_join AS
SELECT
    "user".id AS user_id,
    username,
    first_name,
    last_name,
    email,
    date_of_birth,
    password_hash,
    organisation_id AS org_id,
    name AS org_name,
    user_role,
    registration,
    address,
    logo_url,
    is_system_org
FROM
    "user"
    LEFT JOIN user_organisation ON "user".id = user_id
    LEFT JOIN organisation ON organisation.id = organisation_id;

-- trigger queue
CREATE TYPE public.trigger AS ENUM (
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

CREATE TYPE public.trigger_queue_status AS ENUM (
    'TRIGGERED',
    'ACTIONS_DISPATCHED',
    'ERROR',
    'COMPLETED'
);

CREATE TABLE public.trigger_queue (
    id serial PRIMARY KEY,
    trigger_type public.trigger,
    "table" varchar,
    record_id int,
    event_code varchar,
    data jsonb,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    status public.trigger_queue_status,
    log jsonb
);

-- Function to add triggers to queue
CREATE OR REPLACE FUNCTION public.add_event_to_trigger_queue ()
    RETURNS TRIGGER
    AS $trigger_queue$
BEGIN
    --
    IF TG_TABLE_NAME = 'trigger_schedule' OR TG_TABLE_NAME = 'verification' THEN
        INSERT INTO trigger_queue (trigger_type, "table", record_id, event_code, data, timestamp, status)
            VALUES (NEW.trigger::public.trigger, TG_TABLE_NAME, NEW.id, NEW.event_code, NEW.data, CURRENT_TIMESTAMP, 'TRIGGERED');
        EXECUTE format('UPDATE %s SET trigger = %L WHERE id = %s', TG_TABLE_NAME, 'PROCESSING', NEW.id);
        RETURN NULL;
    ELSE
        INSERT INTO trigger_queue (trigger_type, "table", record_id, timestamp, status)
            VALUES (NEW.trigger::public.trigger, TG_TABLE_NAME, NEW.id, CURRENT_TIMESTAMP, 'TRIGGERED');
        EXECUTE format('UPDATE %s SET trigger = %L WHERE id = %s', TG_TABLE_NAME, 'PROCESSING', NEW.id);
        RETURN NULL;
    END IF;
END;
$trigger_queue$
LANGUAGE plpgsql;

-- Function to Notify Trigger service of TriggerQueue insert
CREATE OR REPLACE FUNCTION public.notify_trigger_queue ()
    RETURNS TRIGGER
    AS $trigger_event$
BEGIN
    PERFORM
        pg_notify('trigger_notifications', json_build_object('trigger_id', NEW.id, 'trigger', NEW.trigger_type, 'table', NEW.table, 'record_id', NEW.record_id, 'event_code', NEW.event_code)::text);
    RETURN NULL;
END;
$trigger_event$
LANGUAGE plpgsql;

-- TRIGGERS for trigger_queue
CREATE TRIGGER trigger_queue
    AFTER INSERT ON public.trigger_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_trigger_queue ();

-- template category table
--
-- places in ui where template_categories can show up
CREATE TYPE public.ui_location AS ENUM (
    'DASHBOARD',
    'LIST',
    'USER',
    'ADMIN',
    'MANAGEMENT'
);

CREATE TABLE public.template_category (
    id serial PRIMARY KEY,
    code varchar NOT NULL UNIQUE,
    title varchar,
    icon varchar,
    ui_location public.ui_location[] DEFAULT '{DASHBOARD, LIST}'
);

-- (application) template table
CREATE TYPE public.template_status AS ENUM (
    'DRAFT',
    'AVAILABLE',
    'DISABLED'
);

CREATE TABLE public.template (
    id serial PRIMARY KEY,
    name varchar,
    name_plural varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT TRUE,
    can_applicant_make_changes boolean DEFAULT TRUE,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '"Thank you! Your application has been submitted."' ::jsonb,
    icon varchar,
    template_category_id integer REFERENCES public.template_category (id),
    version_timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 1

);

-- FUNCTION to generate a new version of template (should run as a trigger)
CREATE OR REPLACE FUNCTION public.set_template_verision ()
    RETURNS TRIGGER
    AS $template_event$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            TEMPLATE
        WHERE
            id != NEW.id AND code = NEW.code AND version = NEW.version) > 0 THEN
        NEW.version = (
            SELECT
                max(version) + 1
            FROM
                TEMPLATE
            WHERE
                code = NEW.code);
        NEW.version_timestamp = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END
$template_event$
LANGUAGE plpgsql;

-- FUNCTION to make sure duplicated templates have 'DRAFT' status
--   but only if there is another version with 'AVAILABLE' status
CREATE OR REPLACE FUNCTION public.set_template_to_draft ()
    RETURNS TRIGGER
    AS $template_event$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            TEMPLATE
        WHERE
            id != NEW.id AND code = NEW.code AND status = 'AVAILABLE') > 0 THEN
        NEW.status = 'DRAFT';
    END IF;
    RETURN NEW;
END
$template_event$
LANGUAGE plpgsql;

-- FUNCTION to set 'AVAILABLE' version of template to 'DISABLED'
-- when another is set to 'AVAILABLE'
CREATE OR REPLACE FUNCTION public.template_status_update ()
    RETURNS TRIGGER
    AS $template_event$
BEGIN
    IF (NEW.status = 'AVAILABLE') THEN
        UPDATE
            public.template
        SET
            status = 'DISABLED'
        WHERE
            code = NEW.code
            AND status = 'AVAILABLE'
            AND id != NEW.id;
    END IF;
    RETURN NULL;
END;
$template_event$
LANGUAGE plpgsql;

--TRIGGER to generate new version of template on insertion or update
CREATE TRIGGER set_template_version_trigger
    BEFORE INSERT OR UPDATE ON public.template
    FOR EACH ROW
    EXECUTE FUNCTION public.set_template_verision ();

--TRIGGER to make sure duplicates templates have 'DRAFT' status
CREATE TRIGGER set_template_to_draft_trigger
    BEFORE INSERT ON public.template
    FOR EACH ROW
    EXECUTE FUNCTION public.set_template_to_draft ();

-- TRIGGER to ensure only one template version can be 'AVAILABLE'
CREATE TRIGGER template_status_update_trigger
    AFTER UPDATE OF status ON public.template
    FOR EACH ROW
    WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.template_status_update ();

-- template_section table
CREATE TABLE public.template_section (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    title varchar,
    code varchar,
    index integer,
    UNIQUE (template_id, code)
);

-- template_stage table
CREATE TABLE public.template_stage (
    id serial PRIMARY KEY,
    number integer,
    title varchar,
    description varchar,
    colour varchar DEFAULT '#24B5DF',
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL
);

-- template_stage_review_level table
CREATE TABLE public.template_stage_review_level (
    id serial PRIMARY KEY,
    stage_id integer REFERENCES public.template_stage (id) ON DELETE CASCADE NOT NULL,
    number integer NOT NULL,
    name varchar NOT NULL,
    description varchar
);

-- permission_policy table
CREATE TYPE public.permission_policy_type AS ENUM (
    'REVIEW',
    'APPLY',
    'ASSIGN',
    'VIEW'
);

CREATE TABLE public.permission_policy (
    id serial PRIMARY KEY,
    name varchar UNIQUE,
    description varchar,
    rules jsonb,
    type public.permission_policy_type,
    is_admin boolean DEFAULT FALSE,
    default_restrictions jsonb
);

-- template filter tables
CREATE TABLE public.filter (
    id serial PRIMARY KEY,
    code varchar NOT NULL UNIQUE,
    title varchar,
    query jsonb,
    user_role public.permission_policy_type
);

CREATE TABLE public.template_filter_join (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    filter_id integer REFERENCES public.filter (id) NOT NULL
);

-- permission_name table
CREATE TABLE public.permission_name (
    id serial PRIMARY KEY,
    name varchar UNIQUE,
    description varchar,
    permission_policy_id integer REFERENCES public.permission_policy (id),
    is_system_org_permission boolean DEFAULT FALSE
);

-- permission_join table
CREATE TABLE public.permission_join (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    permission_name_id integer REFERENCES public.permission_name (id) ON DELETE CASCADE NOT NULL,
    is_active boolean DEFAULT TRUE
);

-- This enforces a UNIQUE requirement for user_id, org_id, and permission_name_id,
-- including only allowing one NULL for org_id for each instance
-- 	For more info:
-- https://matjaz.it/tutorial-unique-constraint-on-null-values-in-postgresql
-- https://stackoverflow.com/questions/42187157/postgresql-partial-indexes-and-upsert
CREATE UNIQUE INDEX unique_user_org_permission ON permission_join (user_id, organisation_id, permission_name_id)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_user_permission ON permission_join (user_id, permission_name_id)
WHERE
    organisation_id IS NULL;

CREATE UNIQUE INDEX unique_org_permission ON permission_join (organisation_id, permission_name_id)
WHERE
    user_id IS NULL;

-- template_permission table
CREATE TABLE public.template_permission (
    id serial PRIMARY KEY,
    permission_name_id integer REFERENCES public.permission_name (id),
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    allowed_sections varchar[] DEFAULT NULL,
    can_self_assign boolean NOT NULL DEFAULT FALSE,
    can_make_final_decision boolean NOT NULL DEFAULT FALSE,
    stage_number integer,
    level_number integer,
    restrictions jsonb
);

CREATE VIEW permissions_all AS (
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
    LEFT JOIN template_category ON "template".template_category_id = template_category.id);

-- template element (questions or information elements)
CREATE TYPE public.template_element_category AS ENUM (
    'QUESTION',
    'INFORMATION'
);

CREATE TYPE public.is_reviewable_status AS ENUM (
    'ALWAYS',
    'NEVER',
    'OPTIONAL_IF_NO_RESPONSE'
    -- TO-DO:
    -- 'OPTIONAL_IF_RESPONSE',
    -- 'OPTIONAL' (the above two combined)
);

-- FUNCTION to return template_code for current element/section
CREATE OR REPLACE FUNCTION public.get_template_code (section_id int)
    RETURNS varchar
    AS $$
    SELECT
        template.code
    FROM
        TEMPLATE
        JOIN template_section ON template_id = template.id
    WHERE
        template_section.id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to return template_version for current element/section
CREATE OR REPLACE FUNCTION public.get_template_version (section_id int)
    RETURNS integer
    AS $$
    SELECT
        template.version
    FROM
        TEMPLATE
        JOIN template_section ON template_id = template.id
    WHERE
        template_section.id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

CREATE TABLE public.template_element (
    id serial PRIMARY KEY,
    section_id integer REFERENCES public.template_section (id) ON DELETE CASCADE NOT NULL,
    code varchar NOT NULL,
    index integer,
    title varchar,
    category public.template_element_category,
    element_type_plugin_code varchar,
    visibility_condition jsonb DEFAULT 'true' ::jsonb,
    is_required jsonb DEFAULT 'true' ::jsonb,
    is_editable jsonb DEFAULT 'true' ::jsonb,
    validation jsonb DEFAULT 'true' ::jsonb,
    default_value jsonb,
    validation_message varchar,
    help_text varchar,
    parameters jsonb,
    is_reviewable public.is_reviewable_status DEFAULT NULL,
    -- review_required boolean NOT NULL DEFAULT TRUE,
    template_code varchar GENERATED ALWAYS AS (public.get_template_code (section_id)) STORED,
    template_version integer GENERATED ALWAYS AS (public.get_template_version (section_id)) STORED,
    UNIQUE (template_code, code, template_version)
);

CREATE FUNCTION public.template_element_parameters_string (template_element public.template_element)
    RETURNS text
    AS $$
    SELECT
        parameters::text
    FROM
        public.template_element
    WHERE
        id = $1.id
$$
LANGUAGE sql
STABLE;

-- Plugins for QuestionType and InfoType elements
CREATE TABLE public.element_type_plugin (
    code varchar PRIMARY KEY,
    name varchar,
    description varchar,
    category public.template_element_category,
    path varchar,
    display_component_name varchar,
    config_component_name varchar,
    required_parameters varchar[]
);

-- application
CREATE TYPE public.application_outcome AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'WITHDRAWN'
);

CREATE TABLE public.application (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    org_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    session_id varchar,
    serial varchar UNIQUE,
    name varchar,
    outcome public.application_outcome DEFAULT 'PENDING',
    is_active bool,
    is_config bool DEFAULT FALSE,
    TRIGGER public.trigger
);

--FUNCTION to update `is_active` to false
-- and application status to "COMPLETED"
CREATE OR REPLACE FUNCTION public.outcome_changed ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    UPDATE
        public.application
    SET
        is_active = FALSE
    WHERE
        id = NEW.id;
    INSERT INTO public.application_status_history (application_stage_history_id, status)
        VALUES ((
                SELECT
                    id
                FROM
                    application_stage_history
                WHERE
                    application_id = NEW.id
                    AND is_current = TRUE),
                'COMPLETED');
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when outcome is updated
CREATE TRIGGER outcome_trigger
    AFTER UPDATE OF outcome ON public.application
    FOR EACH ROW
    WHEN (OLD.outcome = 'PENDING' AND NEW.outcome <> 'PENDING')
    EXECUTE FUNCTION public.outcome_changed ();

--FUNCTION to revert application status/active when OUTCOME is changed back to PENDING
CREATE OR REPLACE FUNCTION public.outcome_reverted ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    UPDATE
        public.application
    SET
        is_active = TRUE
    WHERE
        id = NEW.id;
    INSERT INTO public.application_status_history (application_stage_history_id, status)
        VALUES ((
                SELECT
                    id
                FROM
                    application_stage_history
                WHERE
                    application_id = NEW.id
                    AND is_current = TRUE),
                (
                    SELECT
                        status
                    FROM
                        application_status_history
                    WHERE
                        time_created = (
                            SELECT
                                MAX(time_created)
                            FROM
                                application_status_history
                            WHERE
                                is_current = FALSE
                                AND application_id = NEW.id)));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when outcome is updated
CREATE TRIGGER outcome_revert_trigger
    AFTER UPDATE OF outcome ON public.application
    FOR EACH ROW
    WHEN (NEW.outcome = 'PENDING' AND OLD.outcome <> 'PENDING')
    EXECUTE FUNCTION public.outcome_reverted ();

-- application_note (for internal comments)
CREATE TABLE public.application_note (
    id serial PRIMARY KEY,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    org_id integer REFERENCES public.organisation (id) ON DELETE CASCADE NOT NULL,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    comment varchar NOT NULL
);

-- application stage history
CREATE TABLE public.application_stage_history (
    id serial PRIMARY KEY,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    stage_id integer REFERENCES public.template_stage (id) ON DELETE CASCADE NOT NULL,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    is_current bool DEFAULT TRUE
);

-- FUNCTION to set `is_current` to false on all other stage_histories of current application
CREATE OR REPLACE FUNCTION public.stage_is_current_update ()
    RETURNS TRIGGER
    AS $application_stage_history_event$
BEGIN
    UPDATE
        public.application_stage_history
    SET
        is_current = FALSE
    WHERE
        application_id = NEW.application_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$application_stage_history_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when is_current is updated
CREATE TRIGGER application_stage_history_trigger
    AFTER INSERT OR UPDATE OF is_current ON public.application_stage_history
    FOR EACH ROW
    WHEN (NEW.is_current = TRUE)
    EXECUTE FUNCTION public.stage_is_current_update ();

-- application status history
CREATE TYPE public.application_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'CHANGES_REQUIRED',
  'RE_SUBMITTED',
  'COMPLETED'
);

CREATE TABLE public.application_status_history (
  id serial PRIMARY KEY,
  application_stage_history_id integer REFERENCES public.application_stage_history (id) ON DELETE CASCADE NOT NULL,
  status public.application_status,
  time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
  is_current bool DEFAULT TRUE
);

-- FUNCTION to auto-add application_id to application_status_history table
CREATE OR REPLACE FUNCTION public.application_status_history_application_id (application_stage_history_id int)
  RETURNS int
  AS $$
  SELECT
    application_id
  FROM
    application_stage_history
  WHERE
    id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

ALTER TABLE application_status_history
  ADD application_id INT GENERATED ALWAYS AS (application_status_history_application_id (application_stage_history_id)) STORED;

-- FUNCTION to set `is_current` to false on all other status_histories of current application
CREATE OR REPLACE FUNCTION public.status_is_current_update ()
  RETURNS TRIGGER
  AS $application_status_history_event$
BEGIN
  UPDATE
    public.application_status_history
  SET
    is_current = FALSE
  WHERE
    application_id = NEW.application_id
    AND id <> NEW.id;
  RETURN NULL;
END;
$application_status_history_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when is_current is updated
CREATE TRIGGER application_status_history_trigger
  AFTER INSERT OR UPDATE OF is_current ON public.application_status_history
  FOR EACH ROW
  WHEN (NEW.is_current = TRUE)
  EXECUTE FUNCTION public.status_is_current_update ();

-- Create VIEW which collects ALL application, stage, stage_history, and status_history together
CREATE OR REPLACE VIEW public.application_stage_status_all AS
SELECT
    application.id AS application_id,
    template.id AS template_id,
    template.name AS template_name,
    template.code AS template_code,
    serial,
    application.name,
    session_id,
    user_id,
    org_id,
    stage_id,
    number AS stage_number,
    title AS stage,
    colour AS stage_colour,
    stage.id AS stage_history_id,
    stage.time_created AS stage_history_time_created,
    stage.is_current AS stage_is_current,
    status.id AS status_history_id,
    status.status,
    status.time_created AS status_history_time_created,
    status.is_current AS status_is_current,
    application.outcome
FROM
    application
    JOIN TEMPLATE ON application.template_id = template.id
    LEFT JOIN application_stage_history stage ON application.id = stage.application_id
    LEFT JOIN application_status_history status ON stage.id = status.application_stage_history_id
    LEFT JOIN template_stage ts ON stage.stage_id = ts.id;

-- As above, but only with the CURRENT stage/status
CREATE OR REPLACE VIEW application_stage_status_latest AS
SELECT
    *
FROM
    application_stage_status_all
WHERE (stage_is_current = TRUE
    OR stage_is_current IS NULL)
AND (status_is_current = TRUE
    OR stage_is_current IS NULL);

-- Function to expose stage_number field on application table in GraphQL
CREATE FUNCTION public.application_stage_number (app public.application)
    RETURNS int
    AS $$
    SELECT
        stage_number
    FROM (
        SELECT
            application_id,
            stage_number
        FROM
            public.application_stage_status_latest) AS app_stage_num
WHERE
    app_stage_num.application_id = app.id;

$$
LANGUAGE sql
STABLE;

-- Function to expose stage name field on application table in GraphQL
CREATE FUNCTION public.application_stage (app public.application)
    RETURNS varchar
    AS $$
    SELECT
        stage
    FROM (
        SELECT
            application_id,
            stage
        FROM
            public.application_stage_status_latest) AS app_stage
WHERE
    app_stage.application_id = app.id;

$$
LANGUAGE sql
STABLE;

-- Function to expose status field on application table in GraphQL
CREATE FUNCTION public.application_status (a public.application)
    RETURNS application_status
    AS $$
    SELECT
        status
    FROM (
        SELECT
            application_id,
            status
        FROM
            public.application_stage_status_latest) AS app_status
WHERE
    app_status.application_id = a.id;

$$
LANGUAGE sql
STABLE;

-- application response
CREATE TYPE public.application_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);

CREATE TABLE public.application_response (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id) ON DELETE CASCADE NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    stage_number integer DEFAULT NULL,
    status public.application_response_status DEFAULT 'DRAFT',
    value jsonb,
    is_valid boolean,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamptz
);

-- Function to automatically update "time_updated"
CREATE OR REPLACE FUNCTION public.update_response_timestamp ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    UPDATE
        public.application_response
    SET
        time_updated = NOW()
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when response is updated
CREATE TRIGGER application_response_timestamp_trigger
    AFTER UPDATE OF status,
    value,
    is_valid ON public.application_response
    FOR EACH ROW
    EXECUTE FUNCTION public.update_response_timestamp ();

CREATE OR REPLACE FUNCTION delete_whole_application (application_id int)
    RETURNS boolean
    AS $$
BEGIN
    DELETE FROM application_status_history
    WHERE application_stage_history_id IN (
            SELECT
                id
            FROM
                application_stage_history
            WHERE
                application_stage_history.application_id = $1);
    DELETE FROM application_stage_history
    WHERE application_stage_history.application_id = $1;
    DELETE FROM application_response
    WHERE application_response.application_id = $1;
    DELETE FROM application_section
    WHERE application_section.application_id = $1;
    DELETE FROM "application"
    WHERE "application".id = $1;
    RETURN TRUE;
END;
$$
LANGUAGE plpgsql
VOLATILE;

-- action plugins
CREATE TABLE public.action_plugin (
    id serial PRIMARY KEY,
    code varchar UNIQUE,
    name varchar,
    description varchar,
    path varchar,
    required_parameters varchar[],
    optional_parameters varchar[],
    output_properties varchar[]
);

-- action queue
CREATE TYPE public.action_queue_status AS ENUM (
    'QUEUED',
    'PROCESSING',
    'SUCCESS',
    'FAIL',
    'CONDITION_NOT_MET'
);

CREATE TABLE public.action_queue (
    id serial PRIMARY KEY,
    trigger_event integer REFERENCES public.trigger_queue (id),
    trigger_payload jsonb,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    sequence integer
,
        action_code varchar,
        condition_expression jsonb,
        parameter_queries jsonb,
        parameters_evaluated jsonb,
        status public.action_queue_status,
        output jsonb,
        time_queued timestamptz,
        time_completed timestamptz,
        error_log varchar
);

-- Function to Notify Action service of ActionQueue insert
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
LANGUAGE plpgsql;

-- TRIGGERS for action_queue
CREATE TRIGGER action_queue
    AFTER INSERT ON public.action_queue
    FOR EACH ROW
    WHEN (NEW.status <> 'PROCESSING')
    EXECUTE FUNCTION public.notify_action_queue ();

-- TRIGGER (Listener) on application table
-- Note: couldn't put this in application file as it requires the trigger_queue table and function to be defined first
CREATE TRIGGER application_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.application
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- template action
CREATE TABLE public.template_action (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    code varchar,
    action_code varchar,
    event_code varchar,
    TRIGGER public.trigger,
    condition jsonb DEFAULT 'true' ::jsonb,
    parameter_queries jsonb,
    description varchar,
    sequence integer
);

-- Constraint ensuring that the "code" value must be unique per template
CREATE UNIQUE INDEX unique_template_action_code ON template_action (code, template_id);

CREATE FUNCTION public.template_action_parameters_queries_string (template_action public.template_action)
    RETURNS text
    AS $$
    SELECT
        parameter_queries::text
    FROM
        public.template_action
    WHERE
        id = $1.id
$$
LANGUAGE sql
STABLE;

-- scheduled actions/events
CREATE TABLE public.trigger_schedule (
    id serial PRIMARY KEY,
    event_code varchar,
    time_scheduled timestamptz NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    data jsonb,
    is_active boolean DEFAULT TRUE,
    editor_user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    TRIGGER public.trigger
);

-- event codes must be unique per application
CREATE UNIQUE INDEX unique_application_event ON trigger_schedule (application_id, event_code);

-- TRIGGER (Listener) on trigger_schedule table
CREATE TRIGGER trigger_schedule_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.trigger_schedule
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- review assignment
-- FUNCTION to auto-add template_id to review_assignment
CREATE OR REPLACE FUNCTION public.review_assignment_template_id (application_id int)
    RETURNS int
    AS $$
    SELECT
        template_id
    FROM
        application
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- ENUM
CREATE TYPE public.review_assignment_status AS ENUM (
    'AVAILABLE',
    'ASSIGNED'
);

CREATE TABLE public.review_assignment (
    id serial PRIMARY KEY,
    assigner_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    reviewer_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    stage_id integer REFERENCES public.template_stage (id) ON DELETE CASCADE NOT NULL,
    stage_number integer,
    time_stage_created timestamptz,
    status public.review_assignment_status NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    template_id integer GENERATED ALWAYS AS (public.review_assignment_template_id (application_id)) STORED REFERENCES public.template (id) ON DELETE CASCADE,
    allowed_sections varchar[] DEFAULT NULL,
    assigned_sections varchar[] DEFAULT ARRAY[] ::varchar[] NOT NULL,
    TRIGGER public.trigger,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    level_number integer,
    level_id integer REFERENCES public.template_stage_review_level (id) ON DELETE CASCADE,
    is_last_level boolean,
    is_last_stage boolean,
    is_locked boolean DEFAULT FALSE,
    is_final_decision boolean DEFAULT FALSE,
    is_self_assignable boolean DEFAULT FALSE
);

-- FUNCTION
CREATE OR REPLACE FUNCTION public.empty_assigned_sections ()
    RETURNS TRIGGER
    AS $review_assignment_event$
BEGIN
    UPDATE
        public.review_assignment
    SET
        assigned_sections = '{}'
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$review_assignment_event$
LANGUAGE plpgsql;

-- TRIGGER (Listener) on review_assignment table: To update trigger
CREATE TRIGGER review_assignment_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- TRIGGER (Listener) on review_assignment table: Set assignedSections to [] when changing status to AVAILABLE
CREATE TRIGGER review_assignment_trigger2
    AFTER UPDATE OF status ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.empty_assigned_sections ();

CREATE UNIQUE INDEX unique_review_assignment_with_org ON review_assignment (reviewer_id, organisation_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_review_assignment_no_org ON review_assignment (reviewer_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NULL;

-- review assignment assigner join
CREATE TABLE public.review_assignment_assigner_join (
    id serial PRIMARY KEY,
    assigner_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    review_assignment_id integer REFERENCES public.review_assignment (id) ON DELETE CASCADE NOT NULL
);

CREATE UNIQUE INDEX unique_review_assignment_assigner_with_org ON review_assignment_assigner_join (assigner_id, organisation_id, review_assignment_id)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_review_assignment_assigner_no_org ON review_assignment_assigner_join (assigner_id, review_assignment_id)
WHERE
    organisation_id IS NULL;

-- Function to return count of assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(DISTINCT (te.id))
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
    AND te.template_code = (
        SELECT
            code
        FROM
            TEMPLATE
        WHERE
            id = (
                SELECT
                    template_id
                FROM
                    application
                WHERE
                    id = $1));

$$
LANGUAGE sql
STABLE;

-- FUNCTION to auto-add application_id to review
CREATE OR REPLACE FUNCTION public.review_application_id (review_assignment_id int)
    RETURNS int
    AS $$
    SELECT
        application_id
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add reviewer_id to review
CREATE OR REPLACE FUNCTION public.review_reviewer_id (review_assignment_id int)
    RETURNS int
    AS $$
    SELECT
        reviewer_id
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add level to review
CREATE OR REPLACE FUNCTION public.review_level (review_assignment_id int)
    RETURNS int
    AS $$
    SELECT
        level_number
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add stage_number to review
CREATE OR REPLACE FUNCTION public.review_stage (review_assignment_id int)
    RETURNS int
    AS $$
    SELECT
        stage_number
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add time_stage_created to review
CREATE OR REPLACE FUNCTION public.review_time_stage_created (review_assignment_id int)
    RETURNS timestamptz
    AS $$
    SELECT
        time_stage_created
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add is_last_level to review
CREATE OR REPLACE FUNCTION public.review_is_last_level (review_assignment_id int)
    RETURNS boolean
    AS $$
    SELECT
        is_last_level
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add is_last_stage to review
CREATE OR REPLACE FUNCTION public.review_is_last_stage (review_assignment_id int)
    RETURNS boolean
    AS $$
    SELECT
        is_last_stage
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- FUNCTION to auto-add is_final_decision to review
CREATE OR REPLACE FUNCTION public.review_is_final_decision (review_assignment_id int)
    RETURNS boolean
    AS $$
    SELECT
        is_final_decision
    FROM
        review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- review
CREATE TABLE public.review (
    id serial PRIMARY KEY,
    review_assignment_id integer REFERENCES public.review_assignment (id) ON DELETE CASCADE,
    -- status via review_status_history
    -- time_status_created via review_status_history
    TRIGGER public.trigger,
    application_id integer GENERATED ALWAYS AS (public.review_application_id (review_assignment_id)) STORED REFERENCES public.application (id) ON DELETE CASCADE,
    reviewer_id integer GENERATED ALWAYS AS (public.review_reviewer_id (review_assignment_id)) STORED REFERENCES public.user (id) ON DELETE CASCADE,
    level_number integer GENERATED ALWAYS AS (public.review_level (review_assignment_id)) STORED,
    stage_number integer GENERATED ALWAYS AS (public.review_stage (review_assignment_id)) STORED,
    time_stage_created timestamptz GENERATED ALWAYS AS (public.review_time_stage_created (review_assignment_id)) STORED,
    is_last_level boolean GENERATED ALWAYS AS (public.review_is_last_level (review_assignment_id)) STORED,
    is_last_stage boolean GENERATED ALWAYS AS (public.review_is_last_stage (review_assignment_id)) STORED,
    is_final_decision boolean GENERATED ALWAYS AS (public.review_is_final_decision (review_assignment_id)) STORED
);

-- TRIGGER (Listener) on review table
CREATE TRIGGER review_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.review
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- review response
CREATE TYPE public.review_response_decision AS ENUM (
    'APPROVE',
    'DECLINE',
    'AGREE',
    'DISAGREE'
);

CREATE TYPE public.review_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);

CREATE TYPE public.review_response_recommended_applicant_visibility AS ENUM (
    'ORIGINAL_RESPONSE_VISIBLE_TO_APPLICANT',
    'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT'
);

CREATE TABLE public.review_response (
    id serial PRIMARY KEY,
    comment varchar,
    decision public.review_response_decision,
    application_response_id integer REFERENCES public.application_response (id) ON DELETE CASCADE,
    review_response_link_id integer REFERENCES public.review_response (id) ON DELETE CASCADE,
    original_review_response_id integer REFERENCES public.review_response (id) ON DELETE CASCADE,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE,
    stage_number integer DEFAULT NULL,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamptz,
    is_visible_to_applicant boolean DEFAULT FALSE,
    is_latest_review boolean DEFAULT FALSE,
    template_element_id integer REFERENCES public.template_element ON DELETE CASCADE,
    recommended_applicant_visibility public.review_response_recommended_applicant_visibility DEFAULT 'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT',
    status public.review_response_status DEFAULT 'DRAFT'
);

-- Function to automatically set previous review_responses
-- (for same review & templateElement) as is_latest_review = false
CREATE OR REPLACE FUNCTION public.set_latest_review_response ()
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

-- TRIGGER (Listener) on review_response table: Run set_previous_review_response
CREATE TRIGGER review_response_latest
    AFTER UPDATE OF time_updated ON public.review_response
    FOR EACH ROW
    WHEN (NEW.time_updated > OLD.time_created)
    EXECUTE FUNCTION public.set_latest_review_response ();

-- Function to automatically update "time_updated"
CREATE OR REPLACE FUNCTION public.update_review_response_timestamp ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    UPDATE
        public.review_response
    SET
        time_updated = NOW()
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when response is updated
CREATE TRIGGER review_response_timestamp_trigger
    AFTER UPDATE OF comment,
    decision ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION public.update_review_response_timestamp ();

-- set review response original_review_response_id (the response that links to application id should be available for all responses)
-- also flatten out review response chain by providing template_element_id in review_response and application_response_id
CREATE OR REPLACE FUNCTION set_original_response ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF NEW.review_response_link_id IS NOT NULL THEN
        NEW.original_review_response_id = (
            SELECT
                original_review_response_id
            FROM
                review_response
            WHERE
                id = NEW.review_response_link_id);
        NEW.application_response_id = (
            SELECT
                application_response_id
            FROM
                review_response
            WHERE
                id = NEW.review_response_link_id);
    ELSE
        -- should always be original review_response when review_response_link_id IS NULL
        NEW.original_review_response_id = NEW.id;
    END IF;
    -- application_response should always exist
    NEW.template_element_id = (
        SELECT
            template_element_id
        FROM
            application_response
        WHERE
            id = NEW.application_response_id);
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER set_original_response_trigger
    BEFORE INSERT ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION set_original_response ();

-- review decision
CREATE TYPE public.decision AS ENUM (
    'LIST_OF_QUESTIONS',
    'CONFORM',
    'NON_CONFORM',
    'CHANGES_REQUESTED',
    'NO_DECISION'
);

CREATE TABLE public.review_decision (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE NOT NULL,
    decision public.decision DEFAULT 'NO_DECISION',
    comment varchar,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- exposes latest overall deicison for review
CREATE FUNCTION public.review_latest_decision (review public.review)
    RETURNS public.review_decision
    AS $$
    SELECT
        *
    FROM
        public.review_decision
    WHERE
        review_id = review.id
    ORDER BY
        time_updated DESC
    LIMIT 1
$$
LANGUAGE sql
STABLE;

-- review status history
CREATE TYPE public.review_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'CHANGES_REQUESTED',
    'PENDING',
    'LOCKED',
    'DISCONTINUED'
);

CREATE TABLE public.review_status_history (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE NOT NULL,
    status public.review_status,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    is_current boolean DEFAULT TRUE
);

-- FUNCTION to set `is_current` to false on all other review_status_histories of current review
CREATE OR REPLACE FUNCTION public.review_status_history_is_current_update ()
    RETURNS TRIGGER
    AS $review_status_history_event$
BEGIN
    UPDATE
        public.review_status_history
    SET
        is_current = FALSE
    WHERE
        review_id = NEW.review_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$review_status_history_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when is_current is updated
CREATE TRIGGER review_status_history_trigger
    AFTER INSERT OR UPDATE OF is_current ON public.review_status_history
    FOR EACH ROW
    WHEN (NEW.is_current = TRUE)
    EXECUTE FUNCTION public.review_status_history_is_current_update ();

-- Function to expose status name field on review table in GraphQL
CREATE FUNCTION public.review_status (app public.review)
    RETURNS public.review_status
    AS $$
    SELECT
        "status"
    FROM
        review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$
LANGUAGE sql
STABLE;

-- Function to expose time_status_created field on review table in GraphQL
CREATE FUNCTION public.review_time_status_created (app public.review)
    RETURNS timestamptz
    AS $$
    SELECT
        time_created
    FROM
        review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$
LANGUAGE sql
STABLE;

-- Function to return count of application assignable questions for given application
CREATE FUNCTION public.assignable_questions_count (app_id int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        application_response ar
        JOIN application app ON ar.application_id = app.id
        JOIN template_element te ON ar.template_element_id = te.id
    WHERE
        ar.application_id = $1
        AND te.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

-- Function to return count of assigned questions that can't be re-assigned (review has been submitted)
CREATE FUNCTION public.submitted_assigned_questions_count (app_id int, stage_id int, level_number int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(DISTINCT (te.id))
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
        SELECT
            code
        FROM
            TEMPLATE
        WHERE
            id = (
                SELECT
                    template_id
                FROM
                    application
                WHERE
                    id = $1))
$$
LANGUAGE sql
STABLE;

-- file
CREATE TABLE public.file (
    id serial PRIMARY KEY,
    unique_id varchar UNIQUE NOT NULL,
    original_filename varchar NOT NULL,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    application_serial varchar REFERENCES public.application (serial) ON DELETE CASCADE,
    application_response_id integer REFERENCES public.application_response (id) ON DELETE CASCADE,
    description varchar,
    application_note_id integer REFERENCES public.application_note (id) ON DELETE CASCADE,
    is_output_doc boolean DEFAULT FALSE NOT NULL,
    is_internal_reference_doc boolean DEFAULT FALSE NOT NULL,
    is_external_reference_doc boolean DEFAULT FALSE NOT NULL,
    is_missing boolean DEFAULT FALSE NOT NULL,
    to_be_deleted boolean DEFAULT FALSE NOT NULL,
    file_path varchar NOT NULL,
    thumbnail_path varchar,
    mimetype varchar,
    submitted boolean DEFAULT FALSE,
    timestamp timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Function to Notify server of File record deletion
CREATE OR REPLACE FUNCTION public.notify_file_server ()
    RETURNS TRIGGER
    AS $trigger_event$
BEGIN
    PERFORM
        pg_notify('file_notifications', json_build_object('id', OLD.id, 'uniqueId', OLD.unique_id, 'originalFilename', OLD.original_filename, 'filePath', OLD.file_path, 'thumbnailPath', OLD.thumbnail_path)::text);
    RETURN NULL;
END;
$trigger_event$
LANGUAGE plpgsql;

-- TRIGGER for file table
CREATE TRIGGER file_deletion
    AFTER DELETE ON public.file
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_file_server ();

-- FUNCTION to mark file for deletion if it's no longer a reference doc
CREATE OR REPLACE FUNCTION public.mark_file_for_deletion ()
    RETURNS TRIGGER
    AS $file_event$
BEGIN
    UPDATE
        public.file
    SET
        to_be_deleted = TRUE
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$file_event$
LANGUAGE plpgsql;

-- TRIGGER to execute above function when files no longer reference
CREATE TRIGGER file_no_longer_reference
    AFTER UPDATE ON public.file
    FOR EACH ROW
    WHEN (NEW.is_external_reference_doc = FALSE AND NEW.is_internal_reference_doc = FALSE AND (OLD.is_external_reference_doc = TRUE OR OLD.is_internal_reference_doc = TRUE))
    EXECUTE FUNCTION public.mark_file_for_deletion ();

-- notification
CREATE TABLE public.notification (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE,
    email_recipients varchar,
    subject varchar,
    message varchar,
    attachments varchar[],
    email_sent boolean DEFAULT FALSE,
    is_read boolean DEFAULT FALSE
);

-- verification
CREATE TABLE public.verification (
    id serial PRIMARY KEY,
    unique_id varchar UNIQUE NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    event_code varchar,
    message varchar,
    data jsonb,
    time_created timestamptz DEFAULT NOW(),
    time_expired timestamptz,
    is_verified boolean DEFAULT FALSE,
    TRIGGER public.trigger
);

-- TRIGGER (Listener) on verification table
CREATE TRIGGER verification_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.verification
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- Aggregated VIEW method to get list of assigners and reviewers usernames to allow filtering by those on the application list page
CREATE FUNCTION assignment_list (stageid int)
    RETURNS TABLE (
        application_id int,
        reviewers varchar[],
        assigners varchar[]
    )
    AS $$
    SELECT
        review_assignment.application_id,
        ARRAY_AGG(DISTINCT (CONCAT(reviewer_user.first_name, ' ', reviewer_user.last_name)::varchar)) AS reviewers,
        ARRAY_AGG(DISTINCT (CONCAT(assigner_user.first_name, ' ', assigner_user.last_name)::varchar)) AS assigners
    FROM
        review_assignment
    LEFT JOIN "user" AS assigner_user ON review_assignment.assigner_id = assigner_user.id
    LEFT JOIN "user" AS reviewer_user ON review_assignment.reviewer_id = reviewer_user.id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment.status = 'ASSIGNED'
    -- WHERE assigner_user IS NOT NULL
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

-- Aggregated VIEW method of all related assigner data to each application on application list page
CREATE TYPE public.assigner_action AS ENUM (
    'ASSIGN',
    'ASSIGN_LOCKED',
    'RE_ASSIGN'
);

CREATE FUNCTION assigner_list (stage_id int, assigner_id int)
    RETURNS TABLE (
        application_id int,
        assigner_action public.assigner_action,
        -- is_fully_assigned_level_1 boolean,
        -- assigned_questions_level_1 bigint,
        total_questions bigint,
        total_assigned bigint,
        total_assign_locked bigint
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        CASE WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) >= assignable_questions_count (application_id)
            AND submitted_assigned_questions_count (application_id, $1, level_number) < assigned_questions_count (application_id, $1, level_number) THEN
            'RE_ASSIGN'
        WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) >= assignable_questions_count (application_id)
            AND submitted_assigned_questions_count (application_id, $1, level_number) >= assigned_questions_count (application_id, $1, level_number) THEN
            'ASSIGN_LOCKED'
        WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) < assignable_questions_count (application_id) THEN
            'ASSIGN'
        ELSE
            NULL
        END::assigner_action,
        -- assigned_questions_count(application_id, $1, 1) = assignable_questions_count(application_id) AS is_fully_assigned_level_1,
        -- assigned_questions_count(application_id, $1, 1) AS assigned_questions_level_1,
        assignable_questions_count (application_id) AS total_questions,
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
STABLE;

-- Aggregated VIEW method of reviewer action to each application on application list page
CREATE TYPE public.reviewer_action AS ENUM (
    'SELF_ASSIGN',
    'START_REVIEW',
    'VIEW_REVIEW',
    'CONTINUE_REVIEW',
    'MAKE_DECISION',
    'RESTART_REVIEW',
    'UPDATE_REVIEW',
    'AWAITING_RESPONSE'
);

CREATE FUNCTION review_list (stageid int, reviewerid int, appstatus public.application_status)
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

-- Aggregated VIEW method of all data required for application list page
-- Requires an empty table as setof return and smart comment to make orderBy work (https://github.com/graphile/graphile-engine/pull/378)
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
        -- CASE WHEN is_fully_assigned_level_1 IS NULL THEN
        --     FALSE
        -- ELSE
        --     is_fully_assigned_level_1
        -- END,
        -- assigned_questions_level_1,
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
STABLE;

-- (https://github.com/graphile/graphile-engine/pull/378)
COMMENT ON FUNCTION application_list (userid int) IS E'@sortable';

CREATE FUNCTION application_list_filter_applicant (applicant varchar, template_code varchar)
    RETURNS TABLE (
        applicant varchar
    )
    AS $$
    SELECT DISTINCT
        (applicant)
    FROM
        application_list ()
    WHERE
        applicant ILIKE CONCAT('%', $1, '%')
        AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_organisation (organisation varchar, template_code varchar)
    RETURNS TABLE (
        organisation varchar
    )
    AS $$
    SELECT DISTINCT
        (org_name)
    FROM
        application_list ()
    WHERE
        org_name ILIKE CONCAT('%', $1, '%')
        AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_reviewer (reviewer varchar, template_code varchar)
    RETURNS TABLE (
        reviewer varchar
    )
    AS $$
    SELECT DISTINCT
        reviewers_unset
    FROM
        application_list (),
        unnest(reviewers) reviewers_unset
WHERE
    reviewers_unset ILIKE CONCAT('%', $1, '%')
    AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_assigner (assigner varchar, template_code varchar)
    RETURNS TABLE (
        assigner varchar
    )
    AS $$
    SELECT DISTINCT
        assigners_unset
    FROM
        application_list (),
        unnest(assigners) assigners_unset
WHERE
    assigners_unset ILIKE CONCAT('%', $1, '%')
    AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_stage (template_code varchar)
    RETURNS TABLE (
        stage varchar
    )
    AS $$
    SELECT DISTINCT
        (stage)
    FROM
        application_list ()
    WHERE
        template_code = $1
$$
LANGUAGE sql
STABLE;

-- Data table display configs
CREATE TABLE data_view (
    id serial PRIMARY KEY,
    table_name varchar NOT NULL,
    title varchar,
    code varchar NOT NULL,
    permission_names varchar[],
    row_restrictions jsonb DEFAULT '{}',
    table_view_include_columns varchar[],
    table_view_exclude_columns varchar[],
    detail_view_include_columns varchar[],
    detail_view_exclude_columns varchar[],
    detail_view_header_column varchar NOT NULL,
    show_linked_applications boolean NOT NULL DEFAULT TRUE,
    priority integer DEFAULT 1
);

-- For columns that require more detail format or evaluation definitions
CREATE TABLE data_view_column_definition (
    id serial PRIMARY KEY,
    table_name varchar,
    column_name varchar,
    title varchar,
    element_type_plugin_code varchar,
    element_parameters jsonb,
    additional_formatting jsonb,
    value_expression jsonb,
    UNIQUE (table_name, column_name)
);

-- Table for cataloguing all "data" tables, including lookup tables
CREATE TABLE data_table (
    id serial PRIMARY KEY,
    table_name varchar NOT NULL UNIQUE,
    display_name varchar,
    field_map jsonb,
    is_lookup_table boolean DEFAULT FALSE
);

-- ACTIVITY LOG
-- This script contains "DROP" and "IF EXISTS" statements as it is called as a whole from the migration script
CREATE TYPE public.event_type AS ENUM (
    'STAGE',
    'STATUS',
    'OUTCOME',
    'EXTENSION',
    'ASSIGNMENT',
    'REVIEW',
    'REVIEW_DECISION',
    'PERMISSION' -- This type not (necessarily) tied to an application
);

CREATE TABLE IF NOT EXISTS public.activity_log (
    id serial PRIMARY KEY,
    type public.event_type NOT NULL,
    value varchar NOT NULL,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE,
    "table" varchar NOT NULL,
    record_id integer,
    details jsonb NOT NULL DEFAULT '{}'
);

-- Make an index on the application_id field, since this is the one it will be
-- searched by most often
CREATE INDEX IF NOT EXISTS activity_log_application_index ON activity_log (application_id);

-- TRIGGERS and FUNCTIONS for updating activity log
-- STAGE changes
CREATE OR REPLACE FUNCTION public.stage_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
DECLARE
    stage_num integer;
    stage_name varchar;
    stage_col varchar;
BEGIN
    SELECT
        number,
        title,
        colour INTO stage_num,
        stage_name,
        stage_col
    FROM
        template_stage
    WHERE
        id = NEW.stage_id;
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('STAGE', stage_name, NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('stage', json_build_object('number', stage_num, 'name', stage_name, 'colour', stage_col)));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stage_activity_trigger ON public.application_stage_history;

CREATE TRIGGER stage_activity_trigger
    AFTER INSERT ON public.application_stage_history
    FOR EACH ROW
    EXECUTE FUNCTION stage_activity_log ();

-- STATUS changes
CREATE OR REPLACE FUNCTION public.status_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
DECLARE
    app_id integer;
    prev_status varchar;
BEGIN
    app_id = (
        SELECT
            application_id
        FROM
            application_stage_history
        WHERE
            id = NEW.application_stage_history_id);
    prev_status = (
        SELECT
            status
        FROM
            application_status_history
        WHERE
            application_id = app_id
            AND is_current = TRUE);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('STATUS', NEW.status, app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status));
    RETURN NEW;
END;
$application_event$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS status_activity_trigger ON public.application_status_history;

CREATE TRIGGER status_activity_trigger
-- We run this trigger BEFORE insertion so we can more easily capture the
-- previous status value
    BEFORE INSERT ON public.application_status_history
    FOR EACH ROW
    EXECUTE FUNCTION status_activity_log ();

-- OUTCOME changes
CREATE OR REPLACE FUNCTION public.outcome_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('OUTCOME', NEW.outcome, NEW.id, TG_TABLE_NAME, NEW.id, json_build_object('outcome', NEW.outcome));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS outcome_insert_activity_trigger ON public.application;

CREATE TRIGGER outcome_insert_activity_trigger
    AFTER INSERT ON public.application
    FOR EACH ROW
    EXECUTE FUNCTION outcome_activity_log ();

DROP TRIGGER IF EXISTS outcome_update_activity_trigger ON public.application;

CREATE TRIGGER outcome_update_activity_trigger
    AFTER UPDATE ON public.application
    FOR EACH ROW
    WHEN (NEW.outcome <> OLD.outcome)
    EXECUTE FUNCTION outcome_activity_log ();

-- SCHEDULED EVENT (Deadline) changes
CREATE OR REPLACE FUNCTION public.deadline_extension_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('EXTENSION', NEW.event_code, NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('newDeadline', NEW.time_scheduled, 'extendedBy', json_build_object('userId', NEW.editor_user_id, 'name', (
                        SELECT
                            full_name
                        FROM "user"
                        WHERE
                            id = NEW.editor_user_id))));
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

-- ASSIGNMENT changes
CREATE OR REPLACE FUNCTION public.assignment_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('ASSIGNMENT', (
                CASE WHEN NEW.status = 'ASSIGNED'
                    AND NEW.reviewer_id = NEW.assigner_id THEN
                    'Self-Assigned'
                WHEN NEW.status = 'ASSIGNED'
                    AND NEW.reviewer_id <> NEW.assigner_id THEN
                    'Assigned'
                WHEN NEW.status = 'AVAILABLE' THEN
                    'Unassigned'
                ELSE
                    'ERROR'
                END), NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('status', NEW.status, 'reviewer', json_build_object('id', NEW.reviewer_id, 'name', (
                        SELECT
                            full_name
                        FROM "user"
                        WHERE
                            id = NEW.reviewer_id), 'orgId', NEW.organisation_id, 'orgName', (
                            SELECT
                                name
                            FROM organisation
                            WHERE
                                id = NEW.organisation_id)), 'assigner', json_build_object('id', NEW.assigner_id, 'name', (
                                SELECT
                                    full_name
                                FROM "user"
                                WHERE
                                    id = NEW.assigner_id)), 'stage', json_build_object('number', NEW.stage_number, 'name', (
                                    SELECT
                                        title
                                    FROM template_stage
                                    WHERE
                                        id = NEW.stage_id)), 'sections', COALESCE((
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
                                                id = NEW.id))
                                        AND template_id = NEW.template_id
                                        AND NEW.assigned_sections <> '{}' ORDER BY "index") t), (
                                    SELECT
                                        json_agg(t)
                                    FROM (
                                        SELECT
                                            title, code, "index"
                                        FROM template_section
                                    WHERE
                                        code = ANY (OLD.assigned_sections)
                                        AND template_id = NEW.template_id ORDER BY "index") t)), 'reviewLevel', NEW.level_number));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

-- For this trigger, we watch for changes to TRIGGER field, so it only runs
-- once other triggers have finished
DROP TRIGGER IF EXISTS assignment_activity_trigger ON public.review_assignment;

CREATE TRIGGER assignment_activity_trigger
    AFTER UPDATE ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.assigned_sections <> OLD.assigned_sections)
    -- WHEN (NEW.trigger IS NULL AND OLD.trigger = 'PROCESSING')
    EXECUTE FUNCTION assignment_activity_log ();

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

DROP TRIGGER IF EXISTS review_status_activity_trigger ON public.review_status_history;

CREATE TRIGGER review_status_activity_trigger
-- We run this trigger BEFORE insertion so we can more easily capture the
-- previous status value
    BEFORE INSERT ON public.review_status_history
    FOR EACH ROW
    EXECUTE FUNCTION review_status_activity_log ();

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

DROP TRIGGER IF EXISTS review_decision_activity_trigger ON public.review_decision;

CREATE TRIGGER review_decision_activity_trigger
    AFTER UPDATE ON public.review_decision
    FOR EACH ROW
    WHEN (NEW.decision <> OLD.decision)
    EXECUTE FUNCTION review_decision_activity_log ();

-- PERMISSION CHANGES
CREATE OR REPLACE FUNCTION public.permission_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
DECLARE
    user_id integer;
    username varchar;
    org_id integer;
    org_name varchar;
    permission_id integer;
    permission_name varchar;
    active boolean;
    data record;
    status varchar;
BEGIN
    data = CASE WHEN TG_OP = 'DELETE' THEN
        OLD
    ELSE
        NEW
    END;
    status = CASE WHEN TG_OP = 'DELETE' THEN
        'Revoked'
    ELSE
        'Granted'
    END;
    SELECT DISTINCT
        "userId",
        p.username,
        "orgId",
        "orgName",
        "permissionNameId",
        "permissionName",
        "isActive" INTO user_id,
        username,
        org_id,
        org_name,
        permission_id,
        permission_name,
        active
    FROM
        permissions_all p
    WHERE
        "permissionJoinId" = data.id;
    INSERT INTO public.activity_log (type, value, "table", record_id, details)
        VALUES ('PERMISSION', status, TG_TABLE_NAME, data.id, json_build_object('permission', json_build_object('id', permission_id, 'name', permission_name), 'user', json_build_object('id', user_id, 'username', username, 'name', (
                        SELECT
                            full_name
                        FROM "user"
                        WHERE
                            id = user_id)), 'organisation', json_build_object('id', org_id, 'name', org_name), 'isActive', active));
    RETURN data;
END;
$application_event$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS permission_insert_activity_trigger ON public.permission_join;

CREATE TRIGGER permission_insert_activity_trigger
    AFTER INSERT ON public.permission_join
    FOR EACH ROW
    EXECUTE FUNCTION permission_activity_log ();

DROP TRIGGER IF EXISTS permission_delete_activity_trigger ON public.permission_join;

CREATE TRIGGER permission_delete_activity_trigger
    BEFORE DELETE ON public.permission_join
    FOR EACH ROW
    EXECUTE FUNCTION permission_activity_log ();

DO $$
BEGIN
    CREATE ROLE graphile_user WITH NOLOGIN;
EXCEPTION
    WHEN DUPLICATE_OBJECT THEN
        RAISE NOTICE 'not creating role graphile_user -- it already exists';
END
$$;

ALTER ROLE graphile_user WITH LOGIN;

GRANT ALL PRIVILEGES ON DATABASE tmf_app_manager TO graphile_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO graphile_user;

GRANT ALL PRIVILEGES ON SCHEMA public TO graphile_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO graphile_user;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT
SELECT
, INSERT, UPDATE, DELETE ON TABLES TO graphile_user;

-- counters (for serial generation)
CREATE TABLE public.counter (
    id serial PRIMARY KEY,
    name varchar NOT NULL UNIQUE,
    value integer DEFAULT 0
);

-- For storing system info
CREATE TABLE public.system_info (
    id serial PRIMARY KEY,
    name varchar NOT NULL,
    value jsonb DEFAULT '{}',
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- For primary and foreign key
CREATE OR REPLACE VIEW constraints_info AS
SELECT
    constraints_info.constraint_type,
    constraints_info.table_name AS from_table_name,
    from_column_info.column_name AS from_column_name,
    to_column_info.table_name AS to_table_name,
    to_column_info.column_name AS to_column_name
FROM
    information_schema.table_constraints AS constraints_info
    JOIN information_schema.key_column_usage AS from_column_info ON constraints_info.constraint_name = from_column_info.constraint_name
    JOIN information_schema.constraint_column_usage AS to_column_info ON constraints_info.constraint_name = to_column_info.constraint_name;

-- For full schema info
CREATE OR REPLACE VIEW schema_columns AS
SELECT
    tables_info.table_name,
    tables_info.table_type AS table_type,
    columns_info.column_name,
    columns_info.is_nullable,
    columns_info.is_generated,
    columns_info.data_type,
    element_types.data_type AS sub_data_type,
    constraints_info.constraint_type,
    constraints_info.to_table_name AS fk_to_table_name,
    constraints_info.to_column_name AS fk_to_column_name
FROM
    information_schema.tables AS tables_info
    JOIN information_schema.columns AS columns_info ON tables_info.table_name = columns_info.table_name
    LEFT JOIN information_schema.element_types AS element_types ON columns_info.dtd_identifier = element_types.collection_type_identifier
        AND columns_info.table_name = element_types.object_name
    LEFT JOIN constraints_info ON columns_info.table_name = constraints_info.from_table_name
        AND columns_info.column_name = constraints_info.from_column_name
WHERE
    tables_info.table_schema != 'pg_catalog'
    AND tables_info.table_schema != 'information_schema'
ORDER BY
    columns_info.table_name,
    columns_info.column_name;

CREATE VIEW postgres_row_level AS
SELECT
    *
FROM
    pg_policies
