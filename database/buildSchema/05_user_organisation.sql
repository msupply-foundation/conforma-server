-- user_organisation table

CREATE TABLE public.user_organisation (
    id serial primary key,
    user_id integer references public.user(id),
    organisation_id integer references public.organisation(id),
    user_role varchar
);