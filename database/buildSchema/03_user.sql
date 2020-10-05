-- user table

CREATE TABLE public.user (
    id serial primary key,
    username varchar,
    password varchar,
    email varchar
);