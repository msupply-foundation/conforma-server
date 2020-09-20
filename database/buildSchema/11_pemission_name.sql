-- permission_name table

CREATE TABLE public.permission_name (
    id serial primary key,
    name varchar,
    policy_id integer references public.permission_policy(id)
);