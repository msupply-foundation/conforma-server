-- (application) template table
CREATE TYPE public.template_status AS ENUM (
    'Draft',
    'Available',
    'Disabled'
);

CREATE TABLE public.template (
    id serial PRIMARY KEY,
    name varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT TRUE,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '{"value": "Thank you! Your application has been submitted."}' ::jsonb,
    version_timestamp timestamptz
);

