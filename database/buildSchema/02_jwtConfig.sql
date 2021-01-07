SET check_function_bodies = false;

--
-- Name: jwt_check_text(text); Type: FUNCTION; Schema: public; Owner: -
--

create function jwt_get_text(jwt_key text) returns text as $$
  select COALESCE(current_setting('jwt.claims.' || $1, true)::text, '')
$$ language sql stable;

--
-- Name: jwt_check_boolean(text); Type: FUNCTION; Schema: public; Owner: -
--

create function jwt_get_boolean(jwt_key text) returns boolean as $$
  select COALESCE(current_setting('jwt.claims.' || $1, true)::bool, false)
$$ language sql stable;

--
-- Name: jwt_check_bigint(text); Type: FUNCTION; Schema: public; Owner: -
--

create function jwt_get_bigint(jwt_key text) returns bigint as $$
  select COALESCE(current_setting('jwt.claims.' || $1, true)::bigint, 0)
$$ language sql stable;