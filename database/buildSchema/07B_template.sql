-- (application) template table
CREATE TYPE public.template_status AS ENUM (
    'DRAFT',
    'AVAILABLE',
    'DISABLED'
);

CREATE TABLE public.template (
    id serial PRIMARY KEY,
    name varchar,
    code varchar NOT NULL UNIQUE,
    is_linear boolean DEFAULT TRUE,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '{"value": "Thank you! Your application has been submitted."}' ::jsonb,
    template_category_id integer REFERENCES public.template_category (id),
    version_timestamp timestamptz
);

