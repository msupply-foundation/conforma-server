-- application status history

CREATE TYPE public.application_status AS ENUM ('Draft', 'Withdrawn', 'Submitted', 'Changes Required', 'Re-submitted', 'Completed');

CREATE TABLE public.application_status_history (
    id serial primary key,
    application_stage_history_id integer references public.application_stage_history(id),
    status public.application_status,
    time_created timestamp with time zone,
    is_current bool DEFAULT true
);


-- FUNCTION to set `is_current` to false on all other status_histories of current application
CREATE OR REPLACE FUNCTION public.status_is_current_update()
RETURNS trigger as $application_status_history_event$
BEGIN
	UPDATE public.application_status_history SET is_current = false
	WHERE application_stage_history_id = NEW.application_stage_history_id AND id<>NEW.id;
RETURN NULL;
END;
$application_status_history_event$
LANGUAGE plpgsql;


--TRIGGER to run above function when is_current is updated
CREATE TRIGGER application_status_history_trigger AFTER INSERT OR UPDATE OF is_current ON public.application_status_history
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION public.status_is_current_update()