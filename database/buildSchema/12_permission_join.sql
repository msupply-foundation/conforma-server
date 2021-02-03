-- permission_join table

CREATE TABLE public.permission_join (
    id serial primary key,
    user_id integer references public.user(id),
    organisation_id integer references public.organisation(id),
    permission_name_id integer references public.permission_name(id)
);