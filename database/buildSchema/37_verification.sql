-- verification
CREATE TABLE public.verification (
    id serial PRIMARY KEY,
    unique_id varchar UNIQUE NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    event_code varchar,
    message varchar,
    data jsonb,
    time_created timestamptz DEFAULT NOW(),
    time_expired timestamptz,
    is_verified boolean DEFAULT FALSE,
    TRIGGER public.trigger
);

-- TRIGGER (Listener) on verification table
CREATE TRIGGER verification_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.verification
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

