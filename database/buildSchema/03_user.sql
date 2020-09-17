-- user table

CREATE TYPE public.user_role AS ENUM ('Applicant', 'Reviewer', 'Supervisor', 'Chief', 'Director');

CREATE TABLE public.user (
    id serial primary key,
    username varchar,
    password varchar,
    email varchar,
    role public.user_role
);