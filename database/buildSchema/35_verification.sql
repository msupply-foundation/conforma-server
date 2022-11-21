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

