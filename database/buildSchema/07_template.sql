-- (application) template table
CREATE TYPE public.template_status AS ENUM (
    'Draft',
    'Available',
    'Disabled'
);

CREATE TABLE public.template_category (
    id serial PRIMARY KEY,
    title varchar,
    icon varchar
);

CREATE TABLE public.template (
    id serial PRIMARY KEY,
    name varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT TRUE,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '{"value": "Thank you! Your application has been submitted."}' ::jsonb,
    version_timestamp timestamptz,
    template_category_id integer REFERENCES public.template_category (id)
);

CREATE TABLE public.filter (
    id serial PRIMARY KEY,
    code varchar,
    icon varchar,
    title varchar,
    color varchar DEFAULT '#003BFE',
    query jsonb,
    user_role varchar
);

CREATE TABLE public.template_filter_join (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id),
    template_filter_id integer REFERENCES public.filter (id)
);

