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
                                                and template_id = templ_id
                                                and assigned_sections <> '{}' ))
                                    AND template_id = 10 ORDER BY "index") t), 'level', level_num, 'isLastLevel', is_last_level, 'finalDecision', is_final_decision));
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
                                            and assigned_sections <> '{}' ))
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

