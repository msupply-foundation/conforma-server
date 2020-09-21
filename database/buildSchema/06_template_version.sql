-- template_version table

CREATE TABLE public.template_version (
    id serial primary key,
    number integer,
    time_created timestamp,
    is_current bool
);