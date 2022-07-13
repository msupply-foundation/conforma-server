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
    outcome public.application_outcome,
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

