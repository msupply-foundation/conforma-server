-- (application) template table
CREATE TYPE public.template_status AS ENUM (
    'DRAFT',
    'AVAILABLE',
    'DISABLED'
);

CREATE TABLE public.template (
    id serial PRIMARY KEY,
    name varchar,
    name_plural varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT TRUE,
    can_applicant_make_changes boolean DEFAULT TRUE,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '"Thank you! Your application has been submitted."' ::jsonb,
    icon varchar,
    serial_pattern varchar,
    template_category_id integer REFERENCES public.template_category (id),
    version_timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 1
);

