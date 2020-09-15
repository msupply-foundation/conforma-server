SET check_function_bodies = false;

--
-- Name: jwt_check_policy(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_check_policy(policy_name text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $_$
  select COALESCE(jwt_get_key('policy_' || $1)::bool, false);
$_$;


--
-- Name: jwt_get_key(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_get_key(jwt_key text) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
  select current_setting('jwt.claims.' || $1, true)
$_$;


--
-- Name: jwt_get_policy_links_as_setof_text(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_get_policy_links_as_setof_text(policy_name text) RETURNS SETOF text
    LANGUAGE sql STABLE
    AS $_$
	select jsonb_array_elements_text(jwt_get_policy_links_as_text($1)::jsonb);
$_$;


--
-- Name: jwt_get_policy_links_as_text(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.jwt_get_policy_links_as_text(policy_name text) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
  select COALESCE(nullif(jwt_get_key('policy_links_' || $1), ''), '[]')
$_$;
