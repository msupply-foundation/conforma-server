-- permission_join table

CREATE TABLE public.permission_join (
    id serial primary key,
    user_id integer references public.user(id),
    user_organisation_id integer references public.user_organisation(id),
    permission_name_id integer references public.permission_name(id)
);