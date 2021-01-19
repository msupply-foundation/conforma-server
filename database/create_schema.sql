-- Connect to database first:
\c tmf_app_manager

DROP SCHEMA IF EXISTS public CASCADE;

DROP OWNED BY graphile_user;

DROP USER IF EXISTS graphile_user;

CREATE SCHEMA public;

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET default_table_access_method = heap;



