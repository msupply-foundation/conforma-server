-- template filter tables
CREATE TABLE public.filter (
    id serial PRIMARY KEY,
    code varchar NOT NULL UNIQUE,
    title varchar,
    query jsonb,
    user_role public.permission_policy_type
);

CREATE TABLE public.template_filter_join (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    filter_id integer REFERENCES public.filter (id)
);

