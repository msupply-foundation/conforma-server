-- (application) template table

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');

CREATE TABLE public.template (
    id serial primary key,
    name varchar,
    code varchar,
    status public.template_status,
    is_current_version bool,
    version_timestamp timestamp   
);