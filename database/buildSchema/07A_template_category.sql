-- template category table
CREATE TABLE public.template_category (
    id serial PRIMARY KEY,
    code varchar NOT NULL UNIQUE,
    title varchar,
    icon varchar
);

