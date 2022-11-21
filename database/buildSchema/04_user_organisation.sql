-- user_organisation table
CREATE TABLE public.user_organisation (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE NOT NULL,
    user_role varchar,
    UNIQUE (user_id, organisation_id)
);

