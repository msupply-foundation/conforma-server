-- (application) template table

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');

CREATE TABLE public.template (
    id serial primary key,
    name varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT true,
    start_title varchar,
    start_message varchar,
    status public.template_status,
    submission_message varchar DEFAULT 'Thank you! Your application has been submitted.',
    version_timestamp timestamptz
);