-- application_note (for internal comments)
CREATE TABLE public.application_note (
    id serial PRIMARY KEY,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    org_id integer REFERENCES public.organisation (id) ON DELETE CASCADE NOT NULL,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    comment varchar NOT NULL,
    files integer[]
);

