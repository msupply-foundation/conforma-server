-- scheduled actions/events
CREATE TABLE public.trigger_schedule (
    id serial PRIMARY KEY,
    event_code varchar,
    time_scheduled timestamptz NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    data jsonb,
    is_active boolean DEFAULT TRUE,
    TRIGGER public.trigger
);

-- event codes must be unique per application
CREATE UNIQUE INDEX unique_application_event ON trigger_schedule (application_id, event_code);

-- TRIGGER (Listener) on trigger_schedule table
CREATE TRIGGER trigger_schedule_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.trigger_schedule
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

