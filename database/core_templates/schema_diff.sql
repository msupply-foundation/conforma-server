/*************************************************/
/*** SCRIPT AUTHOR: application-manager-server ***/
/***    CREATED ON: 2022-05-25T03:41:23.989Z   ***/
/*************************************************/

--- BEGIN ALTER TABLE "public"."organisation" ---

ALTER TABLE IF EXISTS "public"."organisation" ADD COLUMN IF NOT EXISTS "registration_documentation" jsonb NULL  ;

--- END ALTER TABLE "public"."organisation" ---

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
