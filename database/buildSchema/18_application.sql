-- application
CREATE TYPE public.application_outcome AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'WITHDRAWN'
);

CREATE TABLE public.application (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    org_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    session_id varchar,
    serial varchar UNIQUE,
    name varchar,
    outcome public.application_outcome DEFAULT 'PENDING',
    is_active bool,
    is_config bool DEFAULT FALSE,
    TRIGGER public.trigger
);

