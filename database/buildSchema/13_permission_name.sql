-- permission_name table
CREATE TABLE public.permission_name (
    id serial PRIMARY KEY,
    name varchar UNIQUE,
    permission_policy_id integer REFERENCES public.permission_policy (id)
);

