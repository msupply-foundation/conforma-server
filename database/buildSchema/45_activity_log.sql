CREATE TYPE public.event_type AS ENUM (
    'STAGE',
    'STATUS',
    'OUTCOME',
    'ASSIGNMENT',
    'REVIEW_STATUS',
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
            application_stage_status_latest
        WHERE
            application_id = app_id
            AND stage_history_id = NEW.application_stage_history_id);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('STATUS', (
                CASE WHEN NEW.status = 'DRAFT'
                    AND prev_status IS NULL THEN
                    'Started'
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
                CASE WHEN NEW.status = 'ASSIGNED' THEN
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
                                    id = NEW.assigner_id)), 'sections', NEW.allowed_sections, 'review_level', NEW.level_number));
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

CREATE TRIGGER review_assignment_activity_trigger
    AFTER UPDATE ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.status <> OLD.status)
    EXECUTE FUNCTION review_assignment_activity_log ();

