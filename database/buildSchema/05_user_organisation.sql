-- user_organisation table

CREATE TABLE public.user_organisation (
    id serial primary key,
    user_id integer references public.user(id),
    organisation_id integer references public.organisation(id),
    user_role varchar
);

-- VIEW table to show users with their organisations

CREATE OR REPLACE VIEW user_org_join AS
SELECT "user".id AS user_id,
	username,
	first_name,
	last_name,
	email,
	date_of_birth,
	password_hash,
	organisation_id as org_id,
	name as org_name,
	user_role,
	registration,
	address,
	logo_url
FROM "user" LEFT JOIN user_organisation ON "user".id = user_id
LEFT JOIN organisation ON organisation.id = organisation_id;