SET check_function_bodies = FALSE;

--
-- Name: jwt_get_text(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_text (jwt_key text)
  RETURNS text
  AS $$
  SELECT
    COALESCE(current_setting('jwt.claims.' || $1, TRUE)::text, '')
$$
LANGUAGE sql
STABLE;

--
-- Name: jwt_get_boolean(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_boolean (jwt_key text)
  RETURNS boolean
  AS $$
  SELECT
    COALESCE(current_setting('jwt.claims.' || $1, TRUE)::bool, FALSE)
$$
LANGUAGE sql
STABLE;

--
-- Name: jwt_get_bigint(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_bigint (jwt_key text)
  RETURNS bigint
  AS $$
  SELECT
    COALESCE(current_setting('jwt.claims.' || $1, TRUE)::bigint, 0)
$$
LANGUAGE sql
STABLE;

