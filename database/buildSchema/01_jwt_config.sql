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
BEGIN
  IF jwt_get_text ($1) = 'true' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$
LANGUAGE plpgsql
STABLE;

--
-- Name: jwt_get_bigint(text); Type: FUNCTION; Schema: public; Owner: -
--
CREATE FUNCTION jwt_get_bigint (jwt_key text)
  RETURNS bigint
  AS $$
BEGIN
  IF jwt_get_text ($1) = '' THEN
    RETURN 0;
  ELSE
    RETURN jwt_get_text ($1)::bigint;
  END IF;
END;
$$
LANGUAGE plpgsql
STABLE;

