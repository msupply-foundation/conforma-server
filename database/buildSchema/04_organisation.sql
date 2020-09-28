-- organisation table

CREATE TABLE public.organisation (
    id serial primary key,
    name varchar,
    licence_number varchar,
    address varchar
);