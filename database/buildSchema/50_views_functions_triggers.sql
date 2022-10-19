-- VIEWS
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
    organisation.address,
    logo_url,
    is_system_org
FROM
    "user"
    LEFT JOIN user_organisation ON "user".id = user_id
    LEFT JOIN organisation ON organisation.id = organisation_id;

-- ALL PERMISSIONS View
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
    LEFT JOIN TEMPLATE ON template.id = template_permission.template_id
    LEFT JOIN template_category ON template.template_category_id = template_category.id);

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

-- Add triggers to trigger queue
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
DROP TRIGGER IF EXISTS trigger_queue ON public.trigger_queue;

CREATE TRIGGER trigger_queue
    AFTER INSERT ON public.trigger_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_trigger_queue ();

-- TEMPLATES
-- FUNCTION to generate a new version of template (should run as a trigger)
CREATE OR REPLACE FUNCTION public.set_template_verision ()
    RETURNS TRIGGER
    AS $template_event$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            public.template
        WHERE
            id != NEW.id AND code = NEW.code AND version = NEW.version) > 0 THEN
        NEW.version = (
            SELECT
                max(version) + 1
            FROM
                public.template
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
            public.template
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
DROP TRIGGER IF EXISTS set_template_version_trigger ON public.template;

CREATE TRIGGER set_template_version_trigger
    BEFORE INSERT OR UPDATE ON public.template
    FOR EACH ROW
    EXECUTE FUNCTION public.set_template_verision ();

--TRIGGER to make sure duplicates templates have 'DRAFT' status
DROP TRIGGER IF EXISTS set_template_to_draft_trigger ON public.template;

CREATE TRIGGER set_template_to_draft_trigger
    BEFORE INSERT ON public.template
    FOR EACH ROW
    EXECUTE FUNCTION public.set_template_to_draft ();

-- TRIGGER to ensure only one template version can be 'AVAILABLE'
DROP TRIGGER IF EXISTS template_status_update_trigger ON public.template;

CREATE TRIGGER template_status_update_trigger
    AFTER UPDATE OF status ON public.template
    FOR EACH ROW
    WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.template_status_update ();

-- TEMPLATE ELEMENT
-- FUNCTION to return template_code for current element/section
CREATE OR REPLACE FUNCTION public.get_template_code (section_id int)
    RETURNS varchar
    AS $$
    SELECT
        template.code
    FROM
        public.template
        JOIN public.template_section ON template_id = template.id
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
        public.template
        JOIN public.template_section ON template_id = template.id
    WHERE
        template_section.id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- Add columns (and index) to template_element table that use the above 2
-- functions
ALTER TABLE public.template_element
    ADD COLUMN IF NOT EXISTS template_code varchar GENERATED ALWAYS AS (public.get_template_code (section_id)) STORED;

ALTER TABLE public.template_element
    ADD COLUMN IF NOT EXISTS template_version integer GENERATED ALWAYS AS (public.get_template_version (section_id)) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS template_element_template_code_code_template_version_idx ON public.template_element (template_code, code, template_version);

-- APPLICATION
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
                    public.application_stage_history
                WHERE
                    application_id = NEW.id
                    AND is_current = TRUE),
                'COMPLETED');
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when outcome is updated
DROP TRIGGER IF EXISTS outcome_trigger ON public.application;

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
                    public.application_stage_history
                WHERE
                    application_id = NEW.id
                    AND is_current = TRUE),
                (
                    SELECT
                        status
                    FROM
                        public.application_status_history
                    WHERE
                        time_created = (
                            SELECT
                                MAX(time_created)
                            FROM
                                public.application_status_history
                            WHERE
                                is_current = FALSE
                                AND application_id = NEW.id)));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when outcome is updated
DROP TRIGGER IF EXISTS outcome_revert_trigger ON public.application;

CREATE TRIGGER outcome_revert_trigger
    AFTER UPDATE OF outcome ON public.application
    FOR EACH ROW
    WHEN (NEW.outcome = 'PENDING' AND OLD.outcome <> 'PENDING')
    EXECUTE FUNCTION public.outcome_reverted ();

-- APPLICATION_STAGE_HISTORY
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
DROP TRIGGER IF EXISTS application_stage_history_trigger ON public.application_stage_history;

CREATE TRIGGER application_stage_history_trigger
    AFTER INSERT OR UPDATE OF is_current ON public.application_stage_history
    FOR EACH ROW
    WHEN (NEW.is_current = TRUE)
    EXECUTE FUNCTION public.stage_is_current_update ();

-- APPLICATION_STATUS_HISTORY
-- FUNCTION to auto-add application_id to application_status_history table
CREATE OR REPLACE FUNCTION public.application_status_history_application_id (application_stage_history_id int)
    RETURNS int
    AS $$
    SELECT
        application_id
    FROM
        public.application_stage_history
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

ALTER TABLE application_status_history
    ADD COLUMN IF NOT EXISTS application_id INT GENERATED ALWAYS AS (application_status_history_application_id (application_stage_history_id)) STORED;

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
DROP TRIGGER IF EXISTS application_status_history_trigger ON public.application_status_history;

CREATE TRIGGER application_status_history_trigger
    AFTER INSERT OR UPDATE OF is_current ON public.application_status_history
    FOR EACH ROW
    WHEN (NEW.is_current = TRUE)
    EXECUTE FUNCTION public.status_is_current_update ();

-- Function to expose stage_number field on application table in GraphQL
CREATE OR REPLACE FUNCTION public.application_stage_number (app public.application)
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
CREATE OR REPLACE FUNCTION public.application_stage (app public.application)
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
CREATE OR REPLACE FUNCTION public.application_status (a public.application)
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

-- APPLICATION_RESPONSE
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
DROP TRIGGER IF EXISTS application_response_timestamp_trigger ON public.application_response;

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
    DELETE FROM public.application_status_history
    WHERE application_stage_history_id IN (
            SELECT
                id
            FROM
                public.application_stage_history
            WHERE
                application_stage_history.application_id = $1);
    DELETE FROM public.application_stage_history
    WHERE application_stage_history.application_id = $1;
    DELETE FROM public.application_response
    WHERE application_response.application_id = $1;
    DELETE FROM public.application_section
    WHERE application_section.application_id = $1;
    DELETE FROM public.application
    WHERE application.id = $1;
    RETURN TRUE;
END;
$$
LANGUAGE plpgsql
VOLATILE;

-- ACTION_QUEUE
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
DROP TRIGGER IF EXISTS action_queue ON public.action_queue;

CREATE TRIGGER action_queue
    AFTER INSERT ON public.action_queue
    FOR EACH ROW
    WHEN (NEW.status <> 'PROCESSING')
    EXECUTE FUNCTION public.notify_action_queue ();

-- TRIGGER (Listener) on application table
DROP TRIGGER IF EXISTS application_trigger ON public.application;

CREATE TRIGGER application_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.application
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- TEMPLATE_ACTION
CREATE OR REPLACE FUNCTION public.template_action_parameters_queries_string (template_action public.template_action)
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

-- TRIGGER_SCHEDULE
-- TRIGGER (Listener) on trigger_schedule table
DROP TRIGGER IF EXISTS trigger_schedule_trigger ON public.trigger_schedule;

CREATE TRIGGER trigger_schedule_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.trigger_schedule
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- REVIEW_ASSIGNMENT
-- FUNCTION to auto-add template_id to review_assignment
CREATE OR REPLACE FUNCTION public.review_assignment_template_id (application_id int)
    RETURNS int
    AS $$
    SELECT
        template_id
    FROM
        public.application
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

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
DROP TRIGGER IF EXISTS review_assignment_trigger ON public.review_assignment;

CREATE TRIGGER review_assignment_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- TRIGGER (Listener) on review_assignment table: Set assignedSections to [] when changing status to AVAILABLE
DROP TRIGGER IF EXISTS review_assignment_trigger2 ON public.review_assignment;

CREATE TRIGGER review_assignment_trigger2
    AFTER UPDATE OF status ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.empty_assigned_sections ();

-- REVIEW
-- These first few functions are duplicated in 31_review.sql as they are
-- needed before the review table is created.
--
-- FUNCTION to auto-add application_id to review
CREATE OR REPLACE FUNCTION public.review_application_id (review_assignment_id int)
    RETURNS int
    AS $$
    SELECT
        application_id
    FROM
        public.review_assignment
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
        public.review_assignment
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
        public.review_assignment
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
        public.review_assignment
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
        public.review_assignment
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
        public.review_assignment
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
        public.review_assignment
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
        public.review_assignment
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- Add columns to "review" now that these functions are defined:
ALTER TABLE public.review
    ADD COLUMN IF NOT EXISTS application_id integer GENERATED ALWAYS AS (public.review_application_id (review_assignment_id)) STORED REFERENCES public.application (id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS reviewer_id integer GENERATED ALWAYS AS (public.review_reviewer_id (review_assignment_id)) STORED REFERENCES public.user (id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS level_number integer GENERATED ALWAYS AS (public.review_level (review_assignment_id)) STORED,
    ADD COLUMN IF NOT EXISTS stage_number integer GENERATED ALWAYS AS (public.review_stage (review_assignment_id)) STORED,
    ADD COLUMN IF NOT EXISTS time_stage_created timestamptz GENERATED ALWAYS AS (public.review_time_stage_created (review_assignment_id)) STORED,
    ADD COLUMN IF NOT EXISTS is_last_level boolean GENERATED ALWAYS AS (public.review_is_last_level (review_assignment_id)) STORED,
    ADD COLUMN IF NOT EXISTS is_last_stage boolean GENERATED ALWAYS AS (public.review_is_last_stage (review_assignment_id)) STORED,
    ADD COLUMN IF NOT EXISTS is_final_decision boolean GENERATED ALWAYS AS (public.review_is_final_decision (review_assignment_id)) STORED;

-- TRIGGER (Listener) on review table
DROP TRIGGER IF EXISTS review_trigger ON public.review;

CREATE TRIGGER review_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.review
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- REVIEW_RESPONSE
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
DROP TRIGGER IF EXISTS review_response_latest ON public.review_response;

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
DROP TRIGGER IF EXISTS review_response_timestamp_trigger ON public.review_response;

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
                public.review_response
            WHERE
                id = NEW.review_response_link_id);
        NEW.application_response_id = (
            SELECT
                application_response_id
            FROM
                public.review_response
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
            public.application_response
        WHERE
            id = NEW.application_response_id);
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_original_response_trigger ON public.review_response;

CREATE TRIGGER set_original_response_trigger
    BEFORE INSERT ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION set_original_response ();

-- REVIEW_DECISION
-- exposes latest overall deicison for review
CREATE OR REPLACE FUNCTION public.review_latest_decision (review public.review)
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

-- REVIEW_STATUS_HISTORY
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
DROP TRIGGER IF EXISTS review_status_history_trigger ON public.review_status_history;

CREATE TRIGGER review_status_history_trigger
    AFTER INSERT OR UPDATE OF is_current ON public.review_status_history
    FOR EACH ROW
    WHEN (NEW.is_current = TRUE)
    EXECUTE FUNCTION public.review_status_history_is_current_update ();

-- Function to expose status name field on review table in GraphQL
CREATE OR REPLACE FUNCTION public.review_status (app public.review)
    RETURNS public.review_status
    AS $$
    SELECT
        "status"
    FROM
        public.review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$
LANGUAGE sql
STABLE;

-- Function to expose time_status_created field on review table in GraphQL
CREATE OR REPLACE FUNCTION public.review_time_status_created (app public.review)
    RETURNS timestamptz
    AS $$
    SELECT
        time_created
    FROM
        public.review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$
LANGUAGE sql
STABLE;

-- REVIEW ASSIGNABLE FUNCTIONS:
-- Function to return elements reviewable questions (per application)
CREATE OR REPLACE FUNCTION public.reviewable_questions (app_id int)
    RETURNS TABLE (
        code varchar,
        reviewability public.reviewability,
        response_id int,
        response_value jsonb,
        is_optional boolean
    )
    AS $$
    SELECT DISTINCT ON (code)
        te.code AS code,
        te.reviewability,
        ar.id AS response_id,
        ar.value AS response_value,
        CASE WHEN ar.value IS NULL
            AND te.reviewability = 'OPTIONAL_IF_NO_RESPONSE' THEN
            TRUE
        ELSE
            FALSE
        END::boolean
    FROM
        public.application_response ar
        JOIN public.application app ON ar.application_id = app.id
        JOIN public.template_element te ON ar.template_element_id = te.id
    WHERE
        ar.application_id = $1
        AND te.category = 'QUESTION'
        AND ((ar.value IS NULL
                AND te.reviewability = 'OPTIONAL_IF_NO_RESPONSE')
            OR (ar.value IS NOT NULL
                AND te.reviewability != 'NEVER'))
    GROUP BY
        te.code,
        ar.time_submitted,
        ar.id,
        te,
        reviewability,
        ar.value
    ORDER BY
        code,
        ar.time_submitted DESC
$$
LANGUAGE sql
STABLE;

-- Function to return elements of assigned questions for current stage/level
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
            public.review_assignment) ra
    JOIN public.template_section ts ON ra.section_code = ts.code
    JOIN public.template_element te ON ts.id = te.section_id
    JOIN public.reviewable_questions (app_id) rq ON rq.code = te.code
    LEFT JOIN public.review ON review.review_assignment_id = ra.id
    LEFT JOIN public.review_response rr ON (rr.application_response_id = rq.response_id
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
STABLE;

-- Function to return TOTAL of reviewable questions (per application)
CREATE OR REPLACE FUNCTION public.reviewable_questions_count (app_id int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        reviewable_questions (app_id)
$$
LANGUAGE sql
STABLE;

-- Function to return TOTAL assigned questions for current stage/level
-- Need to DROP first, due to error with parameter name
DROP FUNCTION IF EXISTS public.assigned_questions_count;

CREATE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level_number int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        assigned_questions (app_id, stage_id, level_number)
$$
LANGUAGE sql
STABLE;

-- Function to return TOTAL of assigned and submitted (element that can't be re-assigned)
CREATE OR REPLACE FUNCTION public.submitted_assigned_questions_count (app_id int, stage_id int, level_number int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        assigned_questions (app_id, stage_id, level_number) aq
WHERE
    aq.review_response_status = 'SUBMITTED'
$$
LANGUAGE sql
STABLE;

-- FILE
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
DROP TRIGGER IF EXISTS file_deletion ON public.file;

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
DROP TRIGGER IF EXISTS file_no_longer_reference ON public.file;

CREATE TRIGGER file_no_longer_reference
    AFTER UPDATE ON public.file
    FOR EACH ROW
    WHEN (NEW.is_external_reference_doc = FALSE AND NEW.is_internal_reference_doc = FALSE AND (OLD.is_external_reference_doc = TRUE OR OLD.is_internal_reference_doc = TRUE))
    EXECUTE FUNCTION public.mark_file_for_deletion ();

-- VERIFICATION
-- TRIGGER (Listener) on verification table
DROP TRIGGER IF EXISTS verification_trigger ON public.verification;

CREATE TRIGGER verification_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.verification
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- ASSIGNMENT_LIST
-- Aggregated VIEW method to get list of assigners and reviewers usernames to allow filtering by those on the application list page
CREATE OR REPLACE FUNCTION assignment_list (stageid int)
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
        public.review_assignment
    LEFT JOIN public."user" AS assigner_user ON review_assignment.assigner_id = assigner_user.id
    LEFT JOIN public."user" AS reviewer_user ON review_assignment.reviewer_id = reviewer_user.id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment.status = 'ASSIGNED'
    -- WHERE assigner_user IS NOT NULL
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

-- ASSIGNER_ACTION_LIST
-- Aggregated VIEW method of all related assigner data to each application on application list page
DROP FUNCTION IF EXISTS assigner_list (integer, integer);

CREATE OR REPLACE FUNCTION assigner_list (stage_id int, assigner_id int)
    RETURNS TABLE (
        application_id int,
        assigner_action public.assigner_action
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
        END::assigner_action
    FROM
        public.review_assignment
    LEFT JOIN public.review_assignment_assigner_join ON review_assignment.id = review_assignment_assigner_join.review_assignment_id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment_assigner_join.assigner_id = $2
    AND (
        SELECT
            outcome
        FROM
            public.application
        WHERE
            id = review_assignment.application_id) = 'PENDING'
GROUP BY
    review_assignment.application_id,
    review_assignment.level_number;

$$
LANGUAGE sql
STABLE;

-- REVIEWER_ACTION_LIST
-- Aggregated VIEW method of reviewer action to each application on application list page
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
        public.review_assignment
    LEFT JOIN public.review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN public.review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
WHERE
    review_assignment.stage_id = $1
    AND review_assignment.reviewer_id = $2
    AND (
        SELECT
            outcome
        FROM
            public.application
        WHERE
            id = review_assignment.application_id) = 'PENDING'
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

-- APPLICATION_LIST_VIEW
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
        assigner_action
    FROM
        public.application app
    LEFT JOIN public.template ON app.template_id = template.id
    LEFT JOIN public."user" ON user_id = "user".id
    LEFT JOIN public.application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
    LEFT JOIN public.organisation org ON app.org_id = org.id
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
-- Required to make 'orderBy' work in application_list
COMMENT ON FUNCTION application_list (userid int) IS E'@sortable';

-- APPLICATION_LIST_FILTERS
CREATE OR REPLACE FUNCTION application_list_filter_applicant (applicant varchar, template_code varchar)
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

CREATE OR REPLACE FUNCTION application_list_filter_organisation (organisation varchar, template_code varchar)
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

CREATE OR REPLACE FUNCTION application_list_filter_reviewer (reviewer varchar, template_code varchar)
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

CREATE OR REPLACE FUNCTION application_list_filter_assigner (assigner varchar, template_code varchar)
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

CREATE OR REPLACE FUNCTION application_list_filter_stage (template_code varchar)
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

-- ACTIVITY_LOG
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
        public.template_stage
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
            public.application_stage_history
        WHERE
            id = NEW.application_stage_history_id);
    prev_status = (
        SELECT
            status
        FROM
            public.application_status_history
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
                        FROM public."user"
                        WHERE
                            id = NEW.editor_user_id))));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deadline_extension_activity_trigger ON public.trigger_schedule;

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
                        FROM public."user"
                        WHERE
                            id = NEW.reviewer_id), 'orgId', NEW.organisation_id, 'orgName', (
                            SELECT
                                name
                            FROM public.organisation
                            WHERE
                                id = NEW.organisation_id)), 'assigner', json_build_object('id', NEW.assigner_id, 'name', (
                                SELECT
                                    full_name
                                FROM public."user"
                                WHERE
                                    id = NEW.assigner_id)), 'stage', json_build_object('number', NEW.stage_number, 'name', (
                                    SELECT
                                        title
                                    FROM public.template_stage
                                    WHERE
                                        id = NEW.stage_id)), 'sections', COALESCE((
                                    SELECT
                                        json_agg(t)
                                    FROM (
                                        SELECT
                                            title, code, "index"
                                        FROM public.template_section
                                    WHERE
                                        code = ANY (ARRAY (
                                                SELECT
                                                    assigned_sections
                                                FROM public.review_assignment
                                            WHERE
                                                id = NEW.id))
                                        AND template_id = NEW.template_id
                                        AND NEW.assigned_sections <> '{}' ORDER BY "index") t), (
                                    SELECT
                                        json_agg(t)
                                    FROM (
                                        SELECT
                                            title, code, "index"
                                        FROM public.template_section
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
        public.review r
    WHERE
        id = NEW.review_id;
    templ_id = (
        SELECT
            template_id
        FROM
            public.application
        WHERE
            id = app_id);
    prev_status = (
        SELECT
            status
        FROM
            public.review_status_history
        WHERE
            review_id = NEW.review_id
            AND is_current = TRUE);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('REVIEW', NEW.status, app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status, 'reviewId', NEW.review_id, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
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
                                FROM public.template_section
                            WHERE
                                code = ANY (ARRAY (
                                        SELECT
                                            assigned_sections
                                        FROM public.review_assignment
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
        public.review r
    WHERE
        id = NEW.review_id;
    templ_id = (
        SELECT
            template_id
        FROM
            public.application
        WHERE
            id = app_id);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('REVIEW_DECISION', NEW.decision, app_id, TG_TABLE_NAME, NEW.id, json_build_object('reviewId', NEW.review_id, 'decision', NEW.decision, 'comment', NEW.comment, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
                        WHERE
                            id = reviewer_id)), 'sections', (
                        SELECT
                            json_agg(t)
                        FROM (
                            SELECT
                                title, code, "index"
                            FROM public.template_section
                            WHERE
                                code = ANY (ARRAY (
                                        SELECT
                                            assigned_sections
                                        FROM public.review_assignment
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
                        FROM public."user"
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

