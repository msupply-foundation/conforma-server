DROP SCHEMA IF EXISTS public CASCADE;

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


SET default_table_access_method = heap;

-- user and organisation

CREATE TYPE public.user_role AS ENUM ('Applicant', 'Reviewer', 'Supervisor', 'Chief', 'Director');
CREATE TYPE public.permission_policy_type AS ENUM ('Review', 'Apply', 'Assign');

CREATE TABLE public.user (
    id serial primary key,
    username varchar,
    password varchar,
    email varchar,
    role public.user_role
);

CREATE TABLE public.organisation (
    id serial primary key,
    name varchar,
    licence_number integer,
    address varchar
);

CREATE TABLE public.user_organisation (
    id serial primary key,
    user_id integer references public.user(id),
    organistion_id integer references public.organisation(id),
    job varchar
);

-- enums

CREATE TYPE public.template_status AS ENUM ('Draft', 'Available', 'Disabled');
CREATE TYPE public.application_stage AS ENUM ('Screening', 'Assessment', 'Final Decision');
CREATE TYPE public.application_status AS ENUM ('Draft', 'Withdrawn', 'Submitted', 'Changes Required', 'Re-submitted', 'Completed');
CREATE TYPE public.application_outcome AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE public.review_status AS ENUM ('Awaiting review', 'In Progress', 'Ready', 'Approvable', 'Non-Approvable');
CREATE TYPE public.review_decision AS ENUM ('Approved', 'Rejected', 'Observations');
CREATE TYPE public.template_element_category AS ENUM ('Question', 'Information');
-- CREATE TYPE public.question_type AS ENUM ('Short Text', 'Long Text', 'Radio Choice', 'Checkbox Choice', 'Dropdown', 'List', 'Auto-complete Text', 'File Upload');
-- CREATE TYPE public.information_type AS ENUM ('Group Start', 'Group End', 'Page Break', 'Text Info', 'Image');
CREATE TYPE public.trigger as ENUM ('onApplicationCreate', 'onApplicationSubmit', 'onApplicationSave', 'onApplicationWithdrawn', 'onReviewStart', 'onReviewEditComment', 'onReviewSave', 'onReviewAssign', 'onApprovalSubmit', 'onScheduleTime');
CREATE TYPE public.action_queue_status as ENUM ('Scheduled', 'Queued', 'Success', 'Fail');
CREATE TYPE public.trigger_queue_status as ENUM ('Triggered', 'Action Dispatched', 'Error');

-- application template

CREATE TABLE public.template_version (
    id serial primary key,
    number integer,
    time_created timestamp,
    is_current bool
);

CREATE TABLE public.template (
    id serial primary key,
    version_id integer references public.template_version,
    template_name varchar,
    code varchar NOT NULL,
    status public.template_status
);

CREATE TABLE public.template_stage (
    id serial primary key,
    tamplate_id integer references public.template(id)
);

CREATE TABLE public.template_section (
    id serial primary key,
    template_id integer references public.template(id),
    title varchar,
    code varchar
);

-- policy and permission

CREATE TABLE public.permission_policy (
    id serial primary key,
    name varchar,
    rules jsonb,
    description varchar,
    type public.permission_policy_type
);

CREATE TABLE public.permission_name (
    id serial primary key,
    name varchar
);

CREATE TABLE public.permission_join (
    id serial primary key,
    user_id integer references public.user(id),
    user_organisation_id integer references public.user_organisation(id),
    permission_name_id integer references public.permission_name(id)
);

CREATE TABLE public.template_permission (
    id serial primary key,
    permission_join_id integer references public.permission_join(id),
    template_id integer references public.template(id),
    template_section_id integer references public.template_section(id),
    permission_policy_id integer references public.permission_policy(id),
    restrictions jsonb
);

-- template element (questions)

CREATE TABLE public.template_element (
    id serial primary key,
    section_id integer references public.template_section(id),
    next_element_id integer references public.template_element(id),
    code varchar NOT NULL,
    title varchar,
    visibility_condition jsonb,
    element_type_plugin_code varchar
);

CREATE TABLE public.template_question (
    id serial primary key,
    is_required boolean DEFAULT true,
    is_editable boolean DEFAULT true,
    parameters jsonb,
    default_value jsonb,
    validation jsonb
) inherits (public.template_element);

CREATE TABLE public.template_information (
    id serial primary key,
    parameters jsonb
) inherits (public.template_element);


-- Plugins for QuestionType and InfoType elements
CREATE TABLE public.element_type_plugin (
	code varchar primary key,
	name varchar,
	description varchar,
	category public.template_element_category,
	path varchar,
	display_component_name varchar,
	config_component_name varchar,
	required_parameters varchar[] 
);




-- application 

CREATE TABLE public.application (
    id serial primary key,
    unique_identifier varchar,
    template_id integer references public.template(id),
    user_id integer references public.user(id),
    serial integer,
    name varchar,
    outcome public.application_outcome,
    is_active bool,
    trigger public.trigger
);

CREATE TABLE public.application_section (
    id serial primary key,
    application_id integer references public.application(id),
    template_section_id integer references public.template_section(id)
);

CREATE TABLE public.application_stage_history (
    id serial primary key,
    application_id integer references public.application(id),
    stage public.application_stage,
    time_created timestamp with time zone,
    is_current bool
);

CREATE TABLE public.application_status_history (
    id serial primary key,
    application_stage_history_id integer references public.application_stage_history(id),
    status public.application_status,
    time_created timestamp with time zone,
    is_current bool
);

CREATE TABLE public.application_response (
    id serial primary key,
    template_question_id integer references public.template_question(id),
    application_id integer references public.application(id),
    value jsonb,
    time_created timestamp with time zone
);

-- triggers & actions

CREATE TABLE public.trigger_queue (
    id serial primary key,
    trigger_type public.trigger,
    "table" varchar,
    record_id int,
    timestamp timestamp,
    payload jsonb,
    status public.trigger_queue_status,
    log jsonb
);

CREATE TABLE public.action_plugin (
--    id serial primary key,
    code varchar primary key,
    name varchar,
    description varchar,
    path varchar,
    function_name varchar,
    required_parameters varchar[]
);

CREATE TABLE public.action_queue (
    id serial primary key,
    trigger_event integer references public.trigger_queue(id),
    action_code varchar,
    parameters jsonb,
    status public.action_queue_status,
    time_queued timestamp,
    time_executed timestamp,
    error_log varchar
);

-- Function to add triggers to queue
CREATE OR REPLACE FUNCTION public.add_event_to_trigger_queue()
RETURNS trigger as $trigger_queue$
BEGIN
	INSERT INTO trigger_queue (trigger_type, "table", record_id, timestamp, status)
		VALUES (NEW.trigger::public.trigger, TG_TABLE_NAME, NEW.id, current_timestamp, 'Triggered');
	EXECUTE format('UPDATE %s SET trigger = NULL WHERE id = %s', TG_TABLE_NAME, NEW.id);	
RETURN NULL;
END;
$trigger_queue$ LANGUAGE plpgsql;

-- Function to Notify Trigger service of TriggerQueue insert
CREATE OR REPLACE FUNCTION public.notify_trigger_queue()
RETURNS trigger as $trigger_event$
BEGIN
PERFORM pg_notify('trigger_notifications', json_build_object(
	'id', NEW.id,
	'trigger', NEW.trigger_type,
	'table', NEW.table,
	'record_id', NEW.record_id
	)::text
);	
RETURN NULL;
END;
$trigger_event$ LANGUAGE plpgsql;

-- Function to Notify Action service of ActionQueue insert
CREATE OR REPLACE FUNCTION public.notify_action_queue()
RETURNS trigger as $action_event$
BEGIN
PERFORM pg_notify('action_notifications', json_build_object(
	'id', NEW.id,
	'code', NEW.action_code,
	'parameters', NEW.parameters
	)::text
);	
RETURN NULL;
END;
$action_event$ LANGUAGE plpgsql;

-- TRIGGERS for trigger_queue & action_queue tables
DROP TRIGGER IF EXISTS trigger_queue ON public.trigger_queue;
DROP TRIGGER IF EXISTS action_queue ON public.action_queue;

CREATE TRIGGER trigger_queue AFTER INSERT ON public.trigger_queue
FOR EACH ROW
EXECUTE FUNCTION public.notify_trigger_queue();

CREATE TRIGGER action_queue AFTER INSERT ON public.action_queue
FOR EACH ROW
EXECUTE FUNCTION public.notify_action_queue();


-- TRIGGER (Listener) on application table

DROP TRIGGER IF EXISTS application_trigger ON public.application;
CREATE TRIGGER application_trigger AFTER INSERT OR UPDATE OF trigger ON public.application
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL)
EXECUTE FUNCTION public.add_event_to_trigger_queue();

CREATE TABLE public.template_action (
    id serial primary key,
    template_id integer references public.template(id),
    action_code varchar,
    previous_action_id integer references public.template_action(id),
    trigger public.trigger,
    condition jsonb,
    parameter_queries jsonb
);


CREATE TABLE public.template_review_stage (
    id serial primary key,
    template_stage_id integer references public.template_stage(id),
    permission_join_id integer references public.permission_join(id),
    next_review_stage_id integer references public.template_review_stage(id),
    name varchar
);

-- REVIEW area

CREATE TABLE public.review (
	id serial primary key,
	application_id integer references public.application(id),
	status public.review_status,
	comment varchar,
	time_created timestamp,
	trigger public.trigger
);

	-- TRIGGER (Listener) on Review table
DROP TRIGGER IF EXISTS review_trigger ON public.review;
CREATE TRIGGER review_trigger AFTER INSERT OR UPDATE OF trigger ON public.review
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL)
EXECUTE FUNCTION public.add_event_to_trigger_queue();

CREATE TABLE public.review_section (
	id serial primary key,
	review_decision public.review_decision,
	comment varchar
);

CREATE TABLE public.review_section_assignment (
	id serial primary key,
	reviewer_id integer references public.user(id),
	assigner_id integer references public.user(id),
	stage_id integer references public.application_stage_history(id),
	section_id integer references public.application_section(id),
	level varchar -- THIS NEEDS SORTING
);

CREATE TABLE public.review_response (
	id serial primary key,
	application_response_id integer references public.application_response(id),
	review_decision public.review_decision,
	comment varchar,
	trigger public.trigger
);

	-- TRIGGER (Listener) on Review_response table
DROP TRIGGER IF EXISTS review_response_trigger ON public.review_response;
CREATE TRIGGER review_response_trigger AFTER INSERT OR UPDATE OF trigger ON public.review_response
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL)
EXECUTE FUNCTION public.add_event_to_trigger_queue();

CREATE TABLE public.review_section_join (
	id serial primary key,
	review_id integer references public.review(id),
	section_assignment_id integer references public.review_section_assignment(id),
	review_section_id integer references public.review_section(id),
	send_to_applicant boolean
);

CREATE TABLE public.review_section_response_join (
	id serial primary key,
	review_section_join_id integer references public.review_section_join(id),
	review_response_id integer references public.review_response(id),
	send_to_applicant boolean
);


-- Notification and Files
CREATE TABLE public.file (
	id serial primary key,
	user_id integer references public.user(id),
	original_filename varchar,
	path varchar,
	mimetype varchar,
	application_id integer references public.application(id),
	application_response_id integer references public.application_response(id)
);

CREATE TABLE public.notification (
	id serial primary key,
	user_id integer references public.user(id),
	application_id integer references public.application(id),
	review_id integer references public.review(id),
	subject varchar,
	message varchar,
	document_id integer references public.file(id),
	is_read boolean
);