-- verification
CREATE TABLE public.verification (
    id serial PRIMARY KEY,
    application_id integer REFERENCES public.application (id) NOT NULL,
    unique_id varchar UNIQUE NOT NULL,
    created_time timestamptz DEFAULT NOW(),
    expiry_time timestamptz,
    is_verified boolean DEFAULT FALSE,
    TRIGGER public.trigger
);

-- TRIGGER (Listener) on verification table
CREATE TRIGGER verification_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.verification
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

