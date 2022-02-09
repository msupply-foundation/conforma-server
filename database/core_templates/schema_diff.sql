/*************************************************/
/*** SCRIPT AUTHOR: application-manager-server ***/
/***    CREATED ON: 2022-02-09T04:27:09.509Z   ***/
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
