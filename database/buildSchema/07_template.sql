-- (application) template table

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');

CREATE TABLE public.template (
    id serial primary key,
    version_id integer references public.template_version,
    name varchar,
    code varchar NOT NULL,
    status public.template_status
);