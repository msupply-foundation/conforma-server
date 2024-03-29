-- Connect to database first:
DROP SCHEMA IF EXISTS public CASCADE;

DROP OWNED BY graphile_user;

DROP USER IF EXISTS graphile_user;

CREATE SCHEMA public;

SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = ON;

SELECT
    pg_catalog.set_config('search_path', '', FALSE);

SET check_function_bodies = FALSE;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = OFF;

SET default_table_access_method = heap;

