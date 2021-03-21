-- (application) template table

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');

CREATE TABLE public.template_category (
    id serial primary key,
    title varchar,
    icon varchar
);

CREATE TABLE public.template (
    id serial primary key,
    name varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT true,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '{"value": "Thank you! Your application has been submitted."}'::jsonb,
    version_timestamp timestamptz,
    template_category_id integer references public.template_category(id)
);


CREATE TABLE public.filter (
    id serial primary key,
    code varchar,
    icon varchar,
    title varchar,
    query jsonb,
    user_role varchar
);

CREATE TABLE public.template_filter_join (
    id serial primary key,
    template_id integer references public.template(id),
    template_filter_id integer references public.filter(id)
);

