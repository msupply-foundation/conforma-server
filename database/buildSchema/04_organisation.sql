-- organisation table
CREATE TABLE public.organisation (
    id serial PRIMARY KEY,
    name varchar UNIQUE,
    registration varchar UNIQUE,
    address varchar,
    logo_url varchar
);

