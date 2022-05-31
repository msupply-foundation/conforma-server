/*************************************************/
/*** SCRIPT AUTHOR: application-manager-server ***/
/***    CREATED ON: 2022-05-26T21:21:57.268Z   ***/
/*************************************************/

--- BEGIN CREATE TABLE "public"."organisation_application_join" ---

CREATE TABLE IF NOT EXISTS "public"."organisation_application_join" (
	"id" serial NOT NULL  ,
	"application_id" int4 NOT NULL  ,
	"organisation_id" int4 NOT NULL  ,
	CONSTRAINT "organisation_application_join_pkey" PRIMARY KEY (id) ,
	CONSTRAINT "organisation_application_join_application_id_fkey" FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE ,
	CONSTRAINT "organisation_application_join_organisation_id_fkey" FOREIGN KEY (organisation_id) REFERENCES organisation(id) ON DELETE CASCADE 
);

ALTER TABLE IF EXISTS "public"."organisation_application_join" OWNER TO postgres;


--- END CREATE TABLE "public"."organisation_application_join" ---

--- BEGIN CREATE TABLE "public"."user_application_join" ---

CREATE TABLE IF NOT EXISTS "public"."user_application_join" (
	"id" serial NOT NULL  ,
	"application_id" int4 NOT NULL  ,
	"user_id" int4 NOT NULL  ,
	CONSTRAINT "user_application_join_pkey" PRIMARY KEY (id) ,
	CONSTRAINT "user_application_join_application_id_fkey" FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE ,
	CONSTRAINT "user_application_join_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE 
);

ALTER TABLE IF EXISTS "public"."user_application_join" OWNER TO postgres;


--- END CREATE TABLE "public"."user_application_join" ---

--- BEGIN ALTER TABLE "public"."organisation" ---

ALTER TABLE IF EXISTS "public"."organisation" ADD COLUMN IF NOT EXISTS "registration_documentation" jsonb NULL  ;

--- END ALTER TABLE "public"."organisation" ---

--- BEGIN ALTER TABLE "public"."data_view" ---

ALTER TABLE IF EXISTS "public"."data_view" ADD CONSTRAINT "outcome_display_pkey" PRIMARY KEY (id);

ALTER TABLE IF EXISTS "public"."data_view" ADD CONSTRAINT "outcome_display_table_name_code_key" UNIQUE (table_name, code);

ALTER TABLE IF EXISTS "public"."data_view" DROP CONSTRAINT IF EXISTS "data_view_pkey";

ALTER TABLE IF EXISTS "public"."data_view" DROP CONSTRAINT IF EXISTS "data_view_table_name_code_key";

CREATE UNIQUE INDEX outcome_display_table_name_code_key ON public.data_view USING btree (table_name, code);

DROP INDEX IF EXISTS data_view_table_name_code_key;

--- END ALTER TABLE "public"."data_view" ---

--- BEGIN ALTER TABLE "public"."data_view_column_definition" ---

ALTER TABLE IF EXISTS "public"."data_view_column_definition" ADD CONSTRAINT "outcome_display_column_definition_pkey" PRIMARY KEY (id);

ALTER TABLE IF EXISTS "public"."data_view_column_definition" ADD CONSTRAINT "outcome_display_column_definition_table_name_column_name_key" UNIQUE (table_name, column_name);

ALTER TABLE IF EXISTS "public"."data_view_column_definition" DROP CONSTRAINT IF EXISTS "data_view_column_definition_pkey";

ALTER TABLE IF EXISTS "public"."data_view_column_definition" DROP CONSTRAINT IF EXISTS "data_view_column_definition_table_name_column_name_key";

CREATE UNIQUE INDEX outcome_display_column_definition_table_name_column_name_key ON public.data_view_column_definition USING btree (table_name, column_name);

DROP INDEX IF EXISTS data_view_column_definition_table_name_column_name_key;

--- END ALTER TABLE "public"."data_view_column_definition" ---

--- BEGIN ALTER FUNCTION "public"."notify_action_queue" ---

DROP FUNCTION IF EXISTS "public"."notify_action_queue"();

CREATE OR REPLACE FUNCTION public.notify_action_queue()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
        BEGIN
            -- IF NEW.status = 'QUEUED' THEN
            PERFORM
                pg_notify('action_notifications', json_build_object('id', NEW.id, 'code', NEW.action_code, 'condition_expression', NEW.condition_expression, 'parameter_queries', NEW.parameter_queries)::text);
            -- END IF;
            RETURN NULL;
        END;
        $function$
;
ALTER FUNCTION "public"."notify_action_queue"() OWNER TO postgres;

--- END ALTER FUNCTION "public"."notify_action_queue" ---

--- BEGIN ALTER FUNCTION "public"."review_list" ---

DROP FUNCTION IF EXISTS "public"."review_list"(integer, integer);

CREATE OR REPLACE FUNCTION public.review_list(stageid integer, reviewerid integer)
 RETURNS TABLE(application_id integer, reviewer_action reviewer_action)
 LANGUAGE sql
 STABLE
AS $function$
    SELECT
        review_assignment.application_id AS application_id,
        CASE WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'CHANGES_REQUESTED') != 0 THEN
            'UPDATE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'PENDING') != 0 THEN
            'RESTART_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'DRAFT'
            AND is_locked = FALSE) != 0 THEN
            'CONTINUE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            AND review_assignment.is_final_decision = TRUE
            AND review_assignment.is_last_stage = TRUE
            AND review = NULL) != 0 THEN
            'MAKE_DECISION'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            AND review.id IS NULL) != 0 THEN
            'START_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'AVAILABLE'
            AND is_self_assignable = TRUE
            AND (review = NULL
            OR is_locked = FALSE)) != 0 THEN
            'SELF_ASSIGN'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            OR review_status_history.status = 'SUBMITTED') != 0 THEN
            'VIEW_REVIEW'
        ELSE
            NULL
        END::public.reviewer_action
    FROM
        review_assignment
    LEFT JOIN review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
    WHERE
        review_assignment.stage_id = $1
        AND review_assignment.reviewer_id = $2
        AND (
            SELECT
                outcome
            FROM
                application
            WHERE
                id = review_assignment.application_id) = 'PENDING'
    GROUP BY
        review_assignment.application_id;
    $function$
;
ALTER FUNCTION "public"."review_list"(integer, integer) OWNER TO postgres;

--- END ALTER FUNCTION "public"."review_list" ---

--- BEGIN ALTER FUNCTION "public"."empty_assigned_sections" ---

DROP FUNCTION IF EXISTS "public"."empty_assigned_sections"();

CREATE OR REPLACE FUNCTION public.empty_assigned_sections()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
        BEGIN
            UPDATE public.review_assignment SET assigned_sections = '{}'
            WHERE id = NEW.id;
            RETURN NULL;
        END;
        $function$
;
ALTER FUNCTION "public"."empty_assigned_sections"() OWNER TO postgres;

--- END ALTER FUNCTION "public"."empty_assigned_sections" ---

--- BEGIN ALTER FUNCTION "public"."assigned_questions_count" ---

DROP FUNCTION IF EXISTS "public"."assigned_questions_count"(integer, integer, integer);

CREATE OR REPLACE FUNCTION public.assigned_questions_count(app_id integer, stage_id integer, level integer)
 RETURNS bigint
 LANGUAGE sql
 STABLE
AS $function$
    SELECT COUNT(DISTINCT (te.id))
    FROM (
            SELECT
                id,
                application_id,
                stage_id,
                level_number,
                status,
                UNNEST(assigned_sections) AS section_code
            FROM
                review_assignment) ra
        JOIN template_section ts ON ra.section_code = ts.code
        JOIN template_element te ON ts.id = te.section_id
    WHERE
        ra.application_id = $1
        AND ra.stage_id = $2
        AND ra.level_number = $3
        AND ra.status = 'ASSIGNED'
        AND te.category = 'QUESTION'
        AND te.template_code = (SELECT code FROM TEMPLATE
            WHERE id = (
                    SELECT template_id FROM application
                    WHERE id = $1));
    $function$
;
ALTER FUNCTION "public"."assigned_questions_count"(integer, integer, integer) OWNER TO postgres;

--- END ALTER FUNCTION "public"."assigned_questions_count" ---

--- BEGIN ALTER FUNCTION "public"."submitted_assigned_questions_count" ---

DROP FUNCTION IF EXISTS "public"."submitted_assigned_questions_count"(integer, integer, integer);

CREATE OR REPLACE FUNCTION public.submitted_assigned_questions_count(app_id integer, stage_id integer, level_number integer)
 RETURNS bigint
 LANGUAGE sql
 STABLE
AS $function$
    SELECT COUNT(DISTINCT (te.id))
    FROM (SELECT id, application_id, stage_id, level_number, status,
            UNNEST(assigned_sections) AS section_code
        FROM review_assignment) ra
    JOIN template_section ts ON ra.section_code = ts.code
    JOIN template_element te ON ts.id = te.section_id
    LEFT JOIN review ON review.review_assignment_id = ra.id
    LEFT JOIN review_status_history rsh ON rsh.review_id = review.id
  WHERE
    ra.application_id = $1
    AND ra.stage_id = $2
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
    AND te.category = 'QUESTION'
    AND rsh.status = 'SUBMITTED'
    AND te.template_code = (
        SELECT code FROM TEMPLATE
        WHERE id = (
          SELECT template_id FROM application
          WHERE id = $1))
    $function$
;
ALTER FUNCTION "public"."submitted_assigned_questions_count"(integer, integer, integer) OWNER TO postgres;

--- END ALTER FUNCTION "public"."submitted_assigned_questions_count" ---

--- BEGIN ALTER FUNCTION "public"."set_original_response" ---

DROP FUNCTION IF EXISTS "public"."set_original_response"();

CREATE OR REPLACE FUNCTION public.set_original_response()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN IF NEW.review_response_link_id IS NOT NULL THEN NEW.original_review_response_id = (
        SELECT original_review_response_id 
        FROM review_response 
        WHERE id = NEW.review_response_link_id);
      NEW.application_response_id = (
        SELECT application_response_id 
        FROM review_response 
        WHERE id = NEW.review_response_link_id);
      ELSE NEW.original_review_response_id = NEW.id;
      END IF;
      -- application_response should always exist
      NEW.template_element_id = (
        SELECT template_element_id 
        FROM application_response 
        WHERE id = NEW.application_response_id);
      RETURN NEW; END;
      $function$
;
ALTER FUNCTION "public"."set_original_response"() OWNER TO postgres;

--- END ALTER FUNCTION "public"."set_original_response" ---

--- BEGIN ALTER FUNCTION "public"."notify_trigger_queue" ---

DROP FUNCTION IF EXISTS "public"."notify_trigger_queue"();

CREATE OR REPLACE FUNCTION public.notify_trigger_queue()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
        BEGIN
            PERFORM
                pg_notify('trigger_notifications', json_build_object('trigger_id', NEW.id, 'trigger', NEW.trigger_type, 'table', NEW.table, 'record_id', NEW.record_id, 'event_code', NEW.event_code)::text);
            RETURN NULL;
        END;
        $function$
;
ALTER FUNCTION "public"."notify_trigger_queue"() OWNER TO postgres;

--- END ALTER FUNCTION "public"."notify_trigger_queue" ---

--- BEGIN CREATE SEQUENCE "public"."organisation_application_join_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."organisation_application_join_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."organisation_application_join_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."organisation_application_join_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."user_application_join_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."user_application_join_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."user_application_join_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."user_application_join_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."outcome_display_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."outcome_display_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."outcome_display_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."outcome_display_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."outcome_display_column_definition_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."outcome_display_column_definition_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."outcome_display_column_definition_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."outcome_display_column_definition_id_seq" ---
