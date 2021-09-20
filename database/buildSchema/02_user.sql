-- user table
CREATE TABLE public.user (
    id serial PRIMARY KEY,
    first_name varchar,
    last_name varchar,
    username varchar UNIQUE,
    email varchar,
    date_of_birth date,
    password_hash varchar
);

