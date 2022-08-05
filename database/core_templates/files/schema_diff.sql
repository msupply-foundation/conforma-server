/*************************************************/
/*** SCRIPT AUTHOR: application-manager-server ***/
/***    CREATED ON: 2021-09-07T01:56:30.317Z   ***/
/*************************************************/

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

--- BEGIN CREATE TABLE "public"."licence" ---

CREATE TABLE IF NOT EXISTS "public"."licence" (
	"id" serial NOT NULL  ,
	"type" varchar NULL  ,
	"serial" varchar NULL  ,
	"company_id" int4 NULL  ,
	"expiry_date" timestamptz NULL  ,
	"company_name" varchar NULL  ,
	"product_type" varchar NULL  ,
	"registration" varchar NULL  ,
	CONSTRAINT "licence_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."licence" OWNER TO postgres;


--- END CREATE TABLE "public"."licence" ---

--- BEGIN CREATE TABLE "public"."licence_application_join" ---

CREATE TABLE IF NOT EXISTS "public"."licence_application_join" (
	"id" serial NOT NULL  ,
	"application_id" int4 NOT NULL  ,
	"licence_id" int4 NOT NULL  ,
	CONSTRAINT "licence_application_join_pkey" PRIMARY KEY (id) ,
	CONSTRAINT "licence_application_join_application_id_fkey" FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE ,
	CONSTRAINT "licence_application_join_licence_id_fkey" FOREIGN KEY (licence_id) REFERENCES licence(id) ON DELETE CASCADE 
);

ALTER TABLE IF EXISTS "public"."licence_application_join" OWNER TO postgres;


--- END CREATE TABLE "public"."licence_application_join" ---

--- BEGIN CREATE TABLE "public"."product_application_join" ---






--- END CREATE TABLE "public"."product_application_join" ---

--- BEGIN CREATE TABLE "public"."product" ---

CREATE TABLE IF NOT EXISTS "public"."product" (
	"id" serial NOT NULL  ,
	"origin" varchar NULL  ,
	"pack_size" varchar NULL  ,
	"company_id" int4 NULL  ,
	"components" varchar NULL  ,
	"shelf_life" jsonb NULL  ,
	"dosage_form" varchar NULL  ,
	"expiry_date" timestamptz NULL  ,
	"company_name" varchar NULL  ,
	"formulations_old" jsonb NULL  ,
	"generic_name" varchar NULL  ,
	"product_name" varchar NULL  ,
	"registration" varchar NULL  ,
	"universal_code" varchar NULL  ,
	"universal_type" varchar NULL  ,
	"application_level" varchar NULL  ,
	"primary_container" varchar NULL  ,
	"registration_date" timestamptz NULL  ,
	"administration_unit" varchar NULL  ,
	"route_administration" varchar NULL  ,
	"country" varchar NULL  ,
	"indications" varchar NULL  ,
	"therapeutic_category" varchar NULL  ,
	CONSTRAINT "product_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."product" OWNER TO postgres;

CREATE TABLE IF NOT EXISTS "public"."product_application_join" (
	"id" serial NOT NULL  ,
	"application_id" int4 NOT NULL  ,
	"product_id" int4 NOT NULL  ,
	CONSTRAINT "product_application_join_pkey" PRIMARY KEY (id) ,
	CONSTRAINT "product_application_join_application_id_fkey" FOREIGN KEY (application_id) REFERENCES application(id) ON DELETE CASCADE ,
	CONSTRAINT "product_application_join_product_id_fkey" FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE 
);

ALTER TABLE IF EXISTS "public"."product_application_join" OWNER TO postgres;

--- END CREATE TABLE "public"."product" ---

--- BEGIN CREATE TABLE "public"."lookup_table_administration_routes" ---

CREATE TABLE IF NOT EXISTS "public"."lookup_table_administration_routes" (
	"id" serial NOT NULL  ,
	"code" varchar NULL  ,
	"name" varchar NULL  ,
	CONSTRAINT "lookup_table_administration_routes_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."lookup_table_administration_routes" OWNER TO postgres;


--- END CREATE TABLE "public"."lookup_table_administration_routes" ---

--- BEGIN CREATE TABLE "public"."lookup_table_dosage_forms" ---

CREATE TABLE IF NOT EXISTS "public"."lookup_table_dosage_forms" (
	"id" serial NOT NULL  ,
	"name" varchar NULL  ,
	CONSTRAINT "lookup_table_dosage_forms_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."lookup_table_dosage_forms" OWNER TO postgres;


--- END CREATE TABLE "public"."lookup_table_dosage_forms" ---

--- BEGIN CREATE TABLE "public"."lookup_table_therapeutic_categories" ---

CREATE TABLE IF NOT EXISTS "public"."lookup_table_therapeutic_categories" (
	"id" serial NOT NULL  ,
	"therapeutic_category" varchar NULL  ,
	"pharmacologic_class" varchar NULL  ,
	"formulary_key_drug_types" varchar NULL  ,
	CONSTRAINT "lookup_table_therapeutic_categories_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."lookup_table_therapeutic_categories" OWNER TO postgres;


--- END CREATE TABLE "public"."lookup_table_therapeutic_categories" ---

--- BEGIN CREATE TABLE "public"."lookup_table_ingredients" ---

CREATE TABLE IF NOT EXISTS "public"."lookup_table_ingredients" (
	"id" serial NOT NULL  ,
	"active_ingredient" varchar NULL  ,
	"api_manufacturer" varchar NULL  ,
	CONSTRAINT "lookup_table_ingredients_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."lookup_table_ingredients" OWNER TO postgres;


--- END CREATE TABLE "public"."lookup_table_ingredients" ---

--- BEGIN CREATE TABLE "public"."lookup_table_containers" ---

CREATE TABLE IF NOT EXISTS "public"."lookup_table_containers" (
	"id" serial NOT NULL  ,
	"code" varchar NULL  ,
	"name" varchar NULL  ,
	CONSTRAINT "lookup_table_containers_pkey" PRIMARY KEY (id) 
);

ALTER TABLE IF EXISTS "public"."lookup_table_containers" OWNER TO postgres;


--- END CREATE TABLE "public"."lookup_table_containers" ---

--- BEGIN CREATE SEQUENCE "public"."lookup_table_dosage_forms_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."lookup_table_dosage_forms_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."lookup_table_dosage_forms_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."lookup_table_dosage_forms_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."lookup_table_therapeutic_categories_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."lookup_table_therapeutic_categories_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."lookup_table_therapeutic_categories_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."lookup_table_therapeutic_categories_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."lookup_table_administration_routes_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."lookup_table_administration_routes_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."lookup_table_administration_routes_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."lookup_table_administration_routes_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."lookup_table_ingredients_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."lookup_table_ingredients_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."lookup_table_ingredients_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."lookup_table_ingredients_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."lookup_table_containers_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."lookup_table_containers_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."lookup_table_containers_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."lookup_table_containers_id_seq" ---

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

--- BEGIN CREATE SEQUENCE "public"."licence_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."licence_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."licence_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."licence_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."licence_application_join_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."licence_application_join_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."licence_application_join_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."licence_application_join_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."product_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."product_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."product_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."product_id_seq" ---

--- BEGIN CREATE SEQUENCE "public"."product_application_join_id_seq" ---


CREATE SEQUENCE IF NOT EXISTS "public"."product_application_join_id_seq" 
	INCREMENT BY 1 
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE;

ALTER SEQUENCE "public"."product_application_join_id_seq" OWNER TO postgres;

--- END CREATE SEQUENCE "public"."product_application_join_id_seq" ---
