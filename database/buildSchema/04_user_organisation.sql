-- user_organisation table
CREATE TABLE public.user_organisation (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE NOT NULL,
    user_role varchar
);

-- VIEW table to show users with their organisations
CREATE OR REPLACE VIEW user_org_join AS
SELECT
    "user".id AS user_id,
    username,
    first_name,
    last_name,
    email,
    date_of_birth,
    password_hash,
    organisation_id AS org_id,
    name AS org_name,
    user_role,
    registration,
    address,
    logo_url,
    is_system_org
FROM
    "user"
    LEFT JOIN user_organisation ON "user".id = user_id
    LEFT JOIN organisation ON organisation.id = organisation_id;

