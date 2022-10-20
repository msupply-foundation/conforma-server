-- adds citext constraint to username for case insensitivity
CREATE EXTENSION IF NOT EXISTS citext;

-- user table
CREATE TABLE public.user (
    id serial PRIMARY KEY,
    first_name varchar,
    last_name varchar,
    full_name varchar GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    username citext UNIQUE,
    email varchar,
    date_of_birth date,
    password_hash varchar
);

