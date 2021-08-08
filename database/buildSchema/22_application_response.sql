-- application response
CREATE TYPE public.application_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);

CREATE TABLE public.application_response (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id),
    application_id integer REFERENCES public.application (id),
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

