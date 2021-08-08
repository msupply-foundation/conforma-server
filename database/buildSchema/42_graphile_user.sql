DO $$
BEGIN
    CREATE ROLE graphile_user WITH NOLOGIN;
EXCEPTION
    WHEN DUPLICATE_OBJECT THEN
        RAISE NOTICE 'not creating role graphile_user -- it already exists';
END
$$;

ALTER ROLE graphile_user WITH LOGIN;

GRANT ALL PRIVILEGES ON DATABASE tmf_app_manager TO graphile_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO graphile_user;

GRANT ALL PRIVILEGES ON SCHEMA public TO graphile_user;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO graphile_user;

ALTER DEFAULT PRIVILEGES FOR USER postgres IN SCHEMA public GRANT
SELECT
, INSERT, UPDATE, DELETE ON TABLES TO graphile_user;

