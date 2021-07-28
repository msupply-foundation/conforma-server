-- scheduled actions/events
CREATE TABLE public.action_schedule (
    id serial PRIMARY KEY,
    table_name varchar,
    entity_id integer,
    template_action_code varchar,
    time_scheduled timestamptz,
    application_id integer REFERENCES public.application (id),
    template_id integer REFERENCES public.template (id),
    TRIGGER public.trigger
);

-- TRIGGER (Listener) on action_schedule table
CREATE TRIGGER action_schedule_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.action_schedule
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

