ALTER TABLE public.application ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE ROLE graphile_user WITH NOLOGIN;
  EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'not creating role my_role -- it already exists';
END
$$;

ALTER ROLE graphile_user WITH LOGIN;
GRANT ALL PRIVILEGES ON DATABASE tmf_app_manager to graphile_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO graphile_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO graphile_user;

