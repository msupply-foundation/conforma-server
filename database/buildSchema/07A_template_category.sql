-- template category table
--
-- places in ui where template_categories can show up
CREATE TYPE public.ui_location AS ENUM (
    'DASHBOARD',
    'MENU',
    'USER',
    'ADMIN'
);

CREATE TABLE public.template_category (
    id serial PRIMARY KEY,
    code varchar NOT NULL UNIQUE,
    title varchar,
    icon varchar,
    ui_location public.ui_location[] DEFAULT '{DASHBOARD, MENU}'
);

