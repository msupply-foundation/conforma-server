-- permission_name table
CREATE TABLE public.permission_name (
    id serial PRIMARY KEY,
    name varchar UNIQUE,
    description varchar,
    permission_policy_id integer REFERENCES public.permission_policy (id),
    is_system_org_permission boolean DEFAULT FALSE
);

