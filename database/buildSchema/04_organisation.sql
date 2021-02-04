-- organisation table

CREATE TABLE public.organisation (
    id serial primary key,
    name varchar UNIQUE,
    licence_number varchar,
    address varchar
);