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

