-- permission_join table

CREATE TABLE public.permission_join (
    id serial primary key,
    user_id integer references public.user(id),
    organisation_id integer references public.organisation(id),
    permission_name_id integer references public.permission_name(id)
);


-- This enforces a UNIQUE requirement for user_id, org_id, and permission_name_id,
-- including only allowing one NULL for org_id for each instance
-- 	For more info:
-- https://matjaz.it/tutorial-unique-constraint-on-null-values-in-postgresql
-- https://stackoverflow.com/questions/42187157/postgresql-partial-indexes-and-upsert

CREATE UNIQUE INDEX unique_user_org_permission
ON permission_join(user_id, organisation_id, permission_name_id)
WHERE organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_user_permission
ON permission_join(user_id, permission_name_id)
WHERE organisation_id IS NULL;