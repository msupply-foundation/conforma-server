-- permission_policy table

CREATE TYPE public.permission_policy_type AS ENUM ('Review', 'Apply', 'Assign');

CREATE TABLE public.permission_policy (
    id serial primary key,
    name varchar,
    rules jsonb,
    description varchar,
    type public.permission_policy_type
);