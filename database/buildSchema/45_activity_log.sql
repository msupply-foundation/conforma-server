CREATE TYPE public.event_type AS ENUM (
    'STAGE',
    'STATUS',
    'OUTCOME',
    'ASSIGNMENT',
    'REVIEW',
    'REVIEW_DECISION',
    'PERMISSION' -- This type not (necessarily) tied to an application
);

CREATE TABLE public.activity_log (
    id serial PRIMARY KEY,
    type public.event_type NOT NULL,
    value varchar,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE,
    "table" varchar NOT NULL,
    record_id integer,
    details jsonb NOT NULL DEFAULT '{}'
);

-- TRIGGERS and FUNCTIONS for updating activity log
-- STAGE changes
CREATE OR REPLACE FUNCTION public.stage_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('STAGE', (
                SELECT
                    title
                FROM
                    template_stage
                WHERE
                    id = NEW.stage_id), NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('stage', (
                        SELECT
                            title FROM template_stage
                        WHERE
                            id = NEW.stage_id)));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

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
        VALUES ('STATUS', (
                CASE WHEN NEW.status = 'DRAFT'
                    AND prev_status IS NULL THEN
                    'Started'
                WHEN NEW.status = 'SUBMITTED'
                    AND prev_status = 'COMPLETED' THEN
                    'New Stage'
                ELSE
                    NEW.status::varchar
                END), app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status));
    RETURN NEW;
END;
$application_event$
LANGUAGE plpgsql;

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

CREATE TRIGGER outcome_insert_activity_trigger
    AFTER INSERT ON public.application
    FOR EACH ROW
    EXECUTE FUNCTION outcome_activity_log ();

CREATE TRIGGER outcome_update_activity_trigger
    AFTER UPDATE ON public.application
    FOR EACH ROW
    WHEN (NEW.outcome <> OLD.outcome)
    EXECUTE FUNCTION outcome_activity_log ();

-- ASSIGNMENT changes
CREATE OR REPLACE FUNCTION public.review_assignment_activity_log ()
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
                            full_name FROM "user"
                        WHERE
                            id = NEW.reviewer_id), 'orgId', NEW.organisation_id, 'orgName', (
                            SELECT
                                name FROM organisation
                            WHERE
                                id = NEW.organisation_id)), 'assigner', json_build_object('id', NEW.assigner_id, 'name', (
                                SELECT
                                    full_name FROM "user"
                                WHERE
                                    id = NEW.assigner_id)), 'stage', json_build_object('number', NEW.stage_number, 'name', (
                                    SELECT
                                        title FROM template_stage
                                    WHERE
                                        id = NEW.stage_id)), 'sections', (
                                    SELECT
                                        json_agg(t)
                                        FROM (
                                            SELECT
                                                title, code, INDEX FROM template_section
                                            WHERE
                                                id = ANY (ARRAY ( SELECT DISTINCT
                                                    template_section_id FROM review_question_assignment_section
                                                WHERE
                                                    review_assignment_id = NEW.id)) ORDER BY INDEX) t), 'review_level', NEW.level_number));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

CREATE TRIGGER review_assignment_activity_trigger
    AFTER UPDATE ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.status <> OLD.status)
    EXECUTE FUNCTION review_assignment_activity_log ();

-- REVIEW STATUS CHANGES
CREATE OR REPLACE FUNCTION public.review_status_activity_log ()
    RETURNS TRIGGER
    AS $application_event$
DECLARE
    app_id integer;
    prev_status varchar;
    reviewer_id integer;
    rev_assignment_id integer;
BEGIN
    app_id = (
        SELECT
            application_id
        FROM
            review
        WHERE
            id = NEW.review_id);
    prev_status = (
        SELECT
            status
        FROM
            review_status_history
        WHERE
            review_id = NEW.review_id
            AND is_current = TRUE);
    reviewer_id = (
        SELECT
            r.reviewer_id
        FROM
            review r
        WHERE
            id = NEW.review_id);
    rev_assignment_id = (
        SELECT
            review_assignment_id
        FROM
            review
        WHERE
            id = NEW.review_id);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('REVIEW', (
                CASE WHEN NEW.status = 'DRAFT'
                    AND prev_status IS NULL THEN
                    'Started'
                ELSE
                    NEW.status::varchar
                END), app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                        SELECT
                            full_name FROM "user"
                        WHERE
                            id = reviewer_id), 'stage', json_build_object('number', (
                                SELECT
                                    stage_number FROM review
                                WHERE
                                    id = NEW.review_id), 'name', 'TO DO IF REQUIRED'), 'sections', (
                                SELECT
                                    json_agg(t)
                                    FROM (
                                        SELECT
                                            title, code, INDEX FROM template_section
                                        WHERE
                                            id = ANY (ARRAY ( SELECT DISTINCT
                                                template_section_id FROM review_question_assignment_section
                                            WHERE
                                                review_assignment_id = rev_assignment_id)) ORDER BY INDEX) t))));
    RETURN NEW;
END;
$application_event$
LANGUAGE plpgsql;

CREATE TRIGGER review_status_activity_trigger
-- We run this trigger BEFORE insertion so we can more easily capture the
-- previous status value
    BEFORE INSERT ON public.review_status_history
    FOR EACH ROW
    EXECUTE FUNCTION review_status_activity_log ();

