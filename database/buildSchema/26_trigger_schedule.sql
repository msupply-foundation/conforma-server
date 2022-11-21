-- scheduled actions/events
CREATE TABLE public.trigger_schedule (
    id serial PRIMARY KEY,
    event_code varchar,
    time_scheduled timestamptz NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    data jsonb,
    is_active boolean DEFAULT TRUE,
    editor_user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    TRIGGER public.trigger
);

-- event codes must be unique per application
CREATE UNIQUE INDEX unique_application_event ON trigger_schedule (application_id, event_code);

