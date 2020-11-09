-- application stage history

CREATE TABLE public.application_stage_history (
    id serial primary key,
    application_id integer references public.application(id),
    stage_id integer references public.template_stage(id),
    time_created timestamp,
    is_current bool DEFAULT true
);


-- FUNCTION to set `is_current` to false on all other stage_histories of current application
CREATE OR REPLACE FUNCTION public.stage_is_current_update()
RETURNS trigger as $application_stage_history_event$
BEGIN
	UPDATE public.application_stage_history SET is_current = false
	WHERE application_id = NEW.application_id AND id<>NEW.id;
RETURN NULL;
END;
$application_stage_history_event$
LANGUAGE plpgsql;


--TRIGGER to run above function when is_current is updated
CREATE TRIGGER application_stage_history_trigger AFTER INSERT OR UPDATE OF is_current ON public.application_stage_history
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION public.stage_is_current_update()