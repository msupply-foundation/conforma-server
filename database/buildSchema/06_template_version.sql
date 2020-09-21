-- template_version table

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');

CREATE TABLE public.template_version (
    id serial primary key,
    number integer,
    time_created timestamp,
    is_current bool
);