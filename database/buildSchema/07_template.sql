-- (application) template table

CREATE TABLE public.template (
    id serial primary key,
    version_id integer references public.template_version,
    template_name varchar,
    code varchar NOT NULL,
    status public.template_status
);