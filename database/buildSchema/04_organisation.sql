-- organisation table

CREATE TABLE public.organisation (
    id serial primary key,
    name varchar UNIQUE,
    registration varchar UNIQUE,
    address varchar,
    logo_url varchar
);