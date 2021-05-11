-- application
CREATE TYPE public.application_outcome AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE public.application (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id),
    user_id integer REFERENCES public.user (id),
    org_id integer REFERENCES public.organisation (id),
    restriction_id jsonb,
    serial varchar UNIQUE,
    name varchar,
    outcome public.application_outcome,
    is_active bool,
    TRIGGER public.trigger
);

--FUNCTION to update `is_active` to false
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
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when outcome is updated
CREATE TRIGGER outcome_trigger
    AFTER INSERT OR UPDATE OF outcome ON public.application
    FOR EACH ROW
    WHEN (NEW.outcome = 'APPROVED' OR NEW.outcome = 'REJECTED')
    EXECUTE FUNCTION public.outcome_changed ()
