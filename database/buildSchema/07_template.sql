-- (application) template table

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');

CREATE TABLE public.template (
    id serial primary key,
    name varchar,
	code varchar NOT NULL,
is_linear boolean DEFAULT true,
    status public.template_status,
    version_timestamp timestamp   
);
