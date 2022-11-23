--
-- PostgreSQL database dump
--

-- Dumped from database version 12.12
-- Dumped by pg_dump version 14.5

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

DROP EVENT TRIGGER IF EXISTS postgraphile_watch_drop;
DROP EVENT TRIGGER IF EXISTS postgraphile_watch_ddl;
DROP POLICY IF EXISTS view_pp8 ON public.application;
DROP POLICY IF EXISTS view_pp7 ON public.review_assignment;
DROP POLICY IF EXISTS view_pp7 ON public.review;
DROP POLICY IF EXISTS view_pp7 ON public.application;
DROP POLICY IF EXISTS view_pp6 ON public.review_assignment;
DROP POLICY IF EXISTS view_pp6 ON public.application;
DROP POLICY IF EXISTS view_pp5 ON public.review_assignment;
DROP POLICY IF EXISTS view_pp5 ON public.application;
DROP POLICY IF EXISTS view_pp4 ON public.review_assignment;
DROP POLICY IF EXISTS view_pp4 ON public.application;
DROP POLICY IF EXISTS view_pp3 ON public.application;
DROP POLICY IF EXISTS view_pp2 ON public.application;
DROP POLICY IF EXISTS view_pp1 ON public.application;
DROP POLICY IF EXISTS update_all_review_assignment ON public.review_assignment;
DROP POLICY IF EXISTS update_all_review ON public.review;
DROP POLICY IF EXISTS update_all_application_response ON public.application_response;
DROP POLICY IF EXISTS update_all_application ON public.application;
DROP POLICY IF EXISTS delete_all_review_assignment ON public.review_assignment;
DROP POLICY IF EXISTS delete_all_revew ON public.review;
DROP POLICY IF EXISTS delete_all_application_response ON public.application_response;
DROP POLICY IF EXISTS delete_all_application ON public.application;
DROP POLICY IF EXISTS create_all_review_assignment ON public.review_assignment;
DROP POLICY IF EXISTS create_all_review ON public.review;
DROP POLICY IF EXISTS create_all_application_response ON public.application_response;
DROP POLICY IF EXISTS create_all_application ON public.application;
ALTER TABLE IF EXISTS ONLY public.verification DROP CONSTRAINT IF EXISTS verification_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_organisation DROP CONSTRAINT IF EXISTS user_organisation_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_organisation DROP CONSTRAINT IF EXISTS user_organisation_organisation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trigger_schedule DROP CONSTRAINT IF EXISTS trigger_schedule_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trigger_schedule DROP CONSTRAINT IF EXISTS trigger_schedule_editor_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.trigger_schedule DROP CONSTRAINT IF EXISTS trigger_schedule_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template DROP CONSTRAINT IF EXISTS template_template_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_stage DROP CONSTRAINT IF EXISTS template_stage_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_stage_review_level DROP CONSTRAINT IF EXISTS template_stage_review_level_stage_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_section DROP CONSTRAINT IF EXISTS template_section_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_permission DROP CONSTRAINT IF EXISTS template_permission_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_permission DROP CONSTRAINT IF EXISTS template_permission_permission_name_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_filter_join DROP CONSTRAINT IF EXISTS template_filter_join_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_filter_join DROP CONSTRAINT IF EXISTS template_filter_join_filter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_element DROP CONSTRAINT IF EXISTS template_element_section_id_fkey;
ALTER TABLE IF EXISTS ONLY public.template_action DROP CONSTRAINT IF EXISTS template_action_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_status_history DROP CONSTRAINT IF EXISTS review_status_history_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_review_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_response DROP CONSTRAINT IF EXISTS review_response_template_element_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_response DROP CONSTRAINT IF EXISTS review_response_review_response_link_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_response DROP CONSTRAINT IF EXISTS review_response_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_response DROP CONSTRAINT IF EXISTS review_response_original_review_response_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_response DROP CONSTRAINT IF EXISTS review_response_application_response_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_decision DROP CONSTRAINT IF EXISTS review_decision_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_stage_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_reviewer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_organisation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_level_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment_assigner_join DROP CONSTRAINT IF EXISTS review_assignment_assigner_join_review_assignment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment_assigner_join DROP CONSTRAINT IF EXISTS review_assignment_assigner_join_organisation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment_assigner_join DROP CONSTRAINT IF EXISTS review_assignment_assigner_join_assigner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_assigner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permission_name DROP CONSTRAINT IF EXISTS permission_name_permission_policy_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permission_join DROP CONSTRAINT IF EXISTS permission_join_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permission_join DROP CONSTRAINT IF EXISTS permission_join_permission_name_id_fkey;
ALTER TABLE IF EXISTS ONLY public.permission_join DROP CONSTRAINT IF EXISTS permission_join_organisation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_review_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_application_serial_fkey;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_application_response_id_fkey;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_application_note_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application DROP CONSTRAINT IF EXISTS application_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application DROP CONSTRAINT IF EXISTS application_template_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_status_history DROP CONSTRAINT IF EXISTS application_status_history_application_stage_history_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_stage_history DROP CONSTRAINT IF EXISTS application_stage_history_stage_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_stage_history DROP CONSTRAINT IF EXISTS application_stage_history_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_response DROP CONSTRAINT IF EXISTS application_response_template_element_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_response DROP CONSTRAINT IF EXISTS application_response_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application DROP CONSTRAINT IF EXISTS application_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_note DROP CONSTRAINT IF EXISTS application_note_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_note DROP CONSTRAINT IF EXISTS application_note_org_id_fkey;
ALTER TABLE IF EXISTS ONLY public.application_note DROP CONSTRAINT IF EXISTS application_note_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_application_id_fkey;
ALTER TABLE IF EXISTS ONLY public.action_queue DROP CONSTRAINT IF EXISTS action_queue_trigger_event_fkey;
ALTER TABLE IF EXISTS ONLY public.action_queue DROP CONSTRAINT IF EXISTS action_queue_template_id_fkey;
DROP TRIGGER IF EXISTS verification_trigger ON public.verification;
DROP TRIGGER IF EXISTS trigger_schedule_trigger ON public.trigger_schedule;
DROP TRIGGER IF EXISTS trigger_queue ON public.trigger_queue;
DROP TRIGGER IF EXISTS template_status_update_trigger ON public.template;
DROP TRIGGER IF EXISTS status_activity_trigger ON public.application_status_history;
DROP TRIGGER IF EXISTS stage_activity_trigger ON public.application_stage_history;
DROP TRIGGER IF EXISTS set_template_version_trigger ON public.template;
DROP TRIGGER IF EXISTS set_template_to_draft_trigger ON public.template;
DROP TRIGGER IF EXISTS set_original_response_trigger ON public.review_response;
DROP TRIGGER IF EXISTS review_trigger ON public.review;
DROP TRIGGER IF EXISTS review_status_history_trigger ON public.review_status_history;
DROP TRIGGER IF EXISTS review_status_activity_trigger ON public.review_status_history;
DROP TRIGGER IF EXISTS review_response_timestamp_trigger ON public.review_response;
DROP TRIGGER IF EXISTS review_response_latest ON public.review_response;
DROP TRIGGER IF EXISTS review_decision_activity_trigger ON public.review_decision;
DROP TRIGGER IF EXISTS review_assignment_validate_section_trigger ON public.review_assignment;
DROP TRIGGER IF EXISTS review_assignment_trigger ON public.review_assignment;
DROP TRIGGER IF EXISTS permission_insert_activity_trigger ON public.permission_join;
DROP TRIGGER IF EXISTS permission_delete_activity_trigger ON public.permission_join;
DROP TRIGGER IF EXISTS outcome_update_activity_trigger ON public.application;
DROP TRIGGER IF EXISTS outcome_trigger ON public.application;
DROP TRIGGER IF EXISTS outcome_revert_trigger ON public.application;
DROP TRIGGER IF EXISTS outcome_insert_activity_trigger ON public.application;
DROP TRIGGER IF EXISTS file_no_longer_reference ON public.file;
DROP TRIGGER IF EXISTS file_deletion ON public.file;
DROP TRIGGER IF EXISTS deadline_extension_activity_trigger ON public.trigger_schedule;
DROP TRIGGER IF EXISTS assignment_activity_trigger ON public.review_assignment;
DROP TRIGGER IF EXISTS application_trigger ON public.application;
DROP TRIGGER IF EXISTS application_status_history_trigger ON public.application_status_history;
DROP TRIGGER IF EXISTS application_stage_history_trigger ON public.application_stage_history;
DROP TRIGGER IF EXISTS application_response_timestamp_trigger ON public.application_response;
DROP TRIGGER IF EXISTS action_queue ON public.action_queue;
DROP INDEX IF EXISTS public.unique_user_permission;
DROP INDEX IF EXISTS public.unique_user_org_permission;
DROP INDEX IF EXISTS public.unique_template_action_code;
DROP INDEX IF EXISTS public.unique_review_assignment_with_org;
DROP INDEX IF EXISTS public.unique_review_assignment_no_org;
DROP INDEX IF EXISTS public.unique_review_assignment_assigner_with_org;
DROP INDEX IF EXISTS public.unique_review_assignment_assigner_no_org;
DROP INDEX IF EXISTS public.unique_org_permission;
DROP INDEX IF EXISTS public.unique_application_event;
DROP INDEX IF EXISTS public.i_verification_application_id_fkey;
DROP INDEX IF EXISTS public.i_user_organisation_organisation_id_fkey;
DROP INDEX IF EXISTS public.i_trigger_schedule_template_id_fkey;
DROP INDEX IF EXISTS public.i_trigger_schedule_editor_user_id_fkey;
DROP INDEX IF EXISTS public.i_template_template_category_id_fkey;
DROP INDEX IF EXISTS public.i_template_status;
DROP INDEX IF EXISTS public.i_template_stage_template_id_fkey;
DROP INDEX IF EXISTS public.i_template_stage_review_level_stage_id_fkey;
DROP INDEX IF EXISTS public.i_template_section_code;
DROP INDEX IF EXISTS public.i_template_permission_template_id_fkey;
DROP INDEX IF EXISTS public.i_template_permission_permission_name_id_fkey;
DROP INDEX IF EXISTS public.i_template_filter_join_template_id_fkey;
DROP INDEX IF EXISTS public.i_template_filter_join_filter_id_fkey;
DROP INDEX IF EXISTS public.i_template_element_template_code;
DROP INDEX IF EXISTS public.i_template_element_section_id_fkey;
DROP INDEX IF EXISTS public.i_template_element_reviewability;
DROP INDEX IF EXISTS public.i_template_element_code;
DROP INDEX IF EXISTS public.i_template_element_category;
DROP INDEX IF EXISTS public.i_template_code;
DROP INDEX IF EXISTS public.i_template_action_template_id_fkey;
DROP INDEX IF EXISTS public.i_review_status_history_review_id_fkey;
DROP INDEX IF EXISTS public.i_review_reviewer_id_fkey;
DROP INDEX IF EXISTS public.i_review_review_assignment_id_fkey;
DROP INDEX IF EXISTS public.i_review_response_template_element_id_fkey;
DROP INDEX IF EXISTS public.i_review_response_status;
DROP INDEX IF EXISTS public.i_review_response_review_response_link_id_fkey;
DROP INDEX IF EXISTS public.i_review_response_review_id_fkey;
DROP INDEX IF EXISTS public.i_review_response_original_review_response_id_fkey;
DROP INDEX IF EXISTS public.i_review_response_application_response_id_fkey;
DROP INDEX IF EXISTS public.i_review_decision_review_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_template_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_status;
DROP INDEX IF EXISTS public.i_review_assignment_stage_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_reviewer_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_organisation_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_level_number;
DROP INDEX IF EXISTS public.i_review_assignment_level_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_assigner_join_review_assignment_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_assigner_join_organisation_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_assigner_join_assigner_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_assigner_id_fkey;
DROP INDEX IF EXISTS public.i_review_assignment_assigned_sections;
DROP INDEX IF EXISTS public.i_review_assignment_application_id_fkey;
DROP INDEX IF EXISTS public.i_review_application_id_fkey;
DROP INDEX IF EXISTS public.i_permission_name_permission_policy_id_fkey;
DROP INDEX IF EXISTS public.i_permission_join_user_id_fkey;
DROP INDEX IF EXISTS public.i_permission_join_permission_name_id_fkey;
DROP INDEX IF EXISTS public.i_permission_join_organisation_id_fkey;
DROP INDEX IF EXISTS public.i_notification_user_id_fkey;
DROP INDEX IF EXISTS public.i_notification_review_id_fkey;
DROP INDEX IF EXISTS public.i_notification_application_id_fkey;
DROP INDEX IF EXISTS public.i_file_user_id_fkey;
DROP INDEX IF EXISTS public.i_file_template_id_fkey;
DROP INDEX IF EXISTS public.i_file_application_serial_fkey;
DROP INDEX IF EXISTS public.i_file_application_response_id_fkey;
DROP INDEX IF EXISTS public.i_file_application_note_id_fkey;
DROP INDEX IF EXISTS public.i_application_user_id_fkey;
DROP INDEX IF EXISTS public.i_application_template_id_fkey;
DROP INDEX IF EXISTS public.i_application_status_history_status;
DROP INDEX IF EXISTS public.i_application_status_history_is_current;
DROP INDEX IF EXISTS public.i_application_status_history_application_stage_history_id_fkey;
DROP INDEX IF EXISTS public.i_application_stage_history_stage_id_fkey;
DROP INDEX IF EXISTS public.i_application_stage_history_is_current;
DROP INDEX IF EXISTS public.i_application_stage_history_application_id_fkey;
DROP INDEX IF EXISTS public.i_application_response_value_is_null;
DROP INDEX IF EXISTS public.i_application_response_value_is_not_null;
DROP INDEX IF EXISTS public.i_application_response_template_element_id_fkey;
DROP INDEX IF EXISTS public.i_application_response_status;
DROP INDEX IF EXISTS public.i_application_response_application_id_fkey;
DROP INDEX IF EXISTS public.i_application_outcome;
DROP INDEX IF EXISTS public.i_application_org_id_fkey;
DROP INDEX IF EXISTS public.i_application_note_user_id_fkey;
DROP INDEX IF EXISTS public.i_application_note_org_id_fkey;
DROP INDEX IF EXISTS public.i_application_note_application_id_fkey;
DROP INDEX IF EXISTS public.i_application_is_config;
DROP INDEX IF EXISTS public.i_application_is_active;
DROP INDEX IF EXISTS public.i_action_queue_trigger_event_fkey;
DROP INDEX IF EXISTS public.i_action_queue_template_id_fkey;
DROP INDEX IF EXISTS public.activity_log_application_index;
ALTER TABLE IF EXISTS ONLY public.verification DROP CONSTRAINT IF EXISTS verification_unique_id_key;
ALTER TABLE IF EXISTS ONLY public.verification DROP CONSTRAINT IF EXISTS verification_pkey;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_username_key;
ALTER TABLE IF EXISTS ONLY public."user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE IF EXISTS ONLY public.user_organisation DROP CONSTRAINT IF EXISTS user_organisation_user_id_organisation_id_key;
ALTER TABLE IF EXISTS ONLY public.user_organisation DROP CONSTRAINT IF EXISTS user_organisation_pkey;
ALTER TABLE IF EXISTS ONLY public.trigger_schedule DROP CONSTRAINT IF EXISTS trigger_schedule_pkey;
ALTER TABLE IF EXISTS ONLY public.trigger_queue DROP CONSTRAINT IF EXISTS trigger_queue_pkey;
ALTER TABLE IF EXISTS ONLY public.template_stage_review_level DROP CONSTRAINT IF EXISTS template_stage_review_level_pkey;
ALTER TABLE IF EXISTS ONLY public.template_stage DROP CONSTRAINT IF EXISTS template_stage_pkey;
ALTER TABLE IF EXISTS ONLY public.template_section DROP CONSTRAINT IF EXISTS template_section_template_id_code_key;
ALTER TABLE IF EXISTS ONLY public.template_section DROP CONSTRAINT IF EXISTS template_section_pkey;
ALTER TABLE IF EXISTS ONLY public.template DROP CONSTRAINT IF EXISTS template_pkey;
ALTER TABLE IF EXISTS ONLY public.template_permission DROP CONSTRAINT IF EXISTS template_permission_pkey;
ALTER TABLE IF EXISTS ONLY public.template_filter_join DROP CONSTRAINT IF EXISTS template_filter_join_pkey;
ALTER TABLE IF EXISTS ONLY public.template_element DROP CONSTRAINT IF EXISTS template_element_template_code_code_template_version_key;
ALTER TABLE IF EXISTS ONLY public.template_element DROP CONSTRAINT IF EXISTS template_element_pkey;
ALTER TABLE IF EXISTS ONLY public.template_category DROP CONSTRAINT IF EXISTS template_category_pkey;
ALTER TABLE IF EXISTS ONLY public.template_category DROP CONSTRAINT IF EXISTS template_category_code_key;
ALTER TABLE IF EXISTS ONLY public.template_action DROP CONSTRAINT IF EXISTS template_action_pkey;
ALTER TABLE IF EXISTS ONLY public.system_info DROP CONSTRAINT IF EXISTS system_info_pkey;
ALTER TABLE IF EXISTS ONLY public.review_status_history DROP CONSTRAINT IF EXISTS review_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.review_response DROP CONSTRAINT IF EXISTS review_response_pkey;
ALTER TABLE IF EXISTS ONLY public.review DROP CONSTRAINT IF EXISTS review_pkey;
ALTER TABLE IF EXISTS ONLY public.review_decision DROP CONSTRAINT IF EXISTS review_decision_pkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment DROP CONSTRAINT IF EXISTS review_assignment_pkey;
ALTER TABLE IF EXISTS ONLY public.review_assignment_assigner_join DROP CONSTRAINT IF EXISTS review_assignment_assigner_join_pkey;
ALTER TABLE IF EXISTS ONLY public.permission_policy DROP CONSTRAINT IF EXISTS permission_policy_pkey;
ALTER TABLE IF EXISTS ONLY public.permission_policy DROP CONSTRAINT IF EXISTS permission_policy_name_key;
ALTER TABLE IF EXISTS ONLY public.permission_name DROP CONSTRAINT IF EXISTS permission_name_pkey;
ALTER TABLE IF EXISTS ONLY public.permission_name DROP CONSTRAINT IF EXISTS permission_name_name_key;
ALTER TABLE IF EXISTS ONLY public.permission_join DROP CONSTRAINT IF EXISTS permission_join_pkey;
ALTER TABLE IF EXISTS ONLY public.organisation DROP CONSTRAINT IF EXISTS organisation_registration_key;
ALTER TABLE IF EXISTS ONLY public.organisation DROP CONSTRAINT IF EXISTS organisation_pkey;
ALTER TABLE IF EXISTS ONLY public.organisation DROP CONSTRAINT IF EXISTS organisation_name_key;
ALTER TABLE IF EXISTS ONLY public.notification DROP CONSTRAINT IF EXISTS notification_pkey;
ALTER TABLE IF EXISTS ONLY public.filter DROP CONSTRAINT IF EXISTS filter_pkey;
ALTER TABLE IF EXISTS ONLY public.filter DROP CONSTRAINT IF EXISTS filter_code_key;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_unique_id_key;
ALTER TABLE IF EXISTS ONLY public.file DROP CONSTRAINT IF EXISTS file_pkey;
ALTER TABLE IF EXISTS ONLY public.element_type_plugin DROP CONSTRAINT IF EXISTS element_type_plugin_pkey;
ALTER TABLE IF EXISTS ONLY public.data_view DROP CONSTRAINT IF EXISTS data_view_pkey;
ALTER TABLE IF EXISTS ONLY public.data_view_column_definition DROP CONSTRAINT IF EXISTS data_view_column_definition_table_name_column_name_key;
ALTER TABLE IF EXISTS ONLY public.data_view_column_definition DROP CONSTRAINT IF EXISTS data_view_column_definition_pkey;
ALTER TABLE IF EXISTS ONLY public.data_table DROP CONSTRAINT IF EXISTS data_table_table_name_key;
ALTER TABLE IF EXISTS ONLY public.data_table DROP CONSTRAINT IF EXISTS data_table_pkey;
ALTER TABLE IF EXISTS ONLY public.counter DROP CONSTRAINT IF EXISTS counter_pkey;
ALTER TABLE IF EXISTS ONLY public.counter DROP CONSTRAINT IF EXISTS counter_name_key;
ALTER TABLE IF EXISTS ONLY public.application_status_history DROP CONSTRAINT IF EXISTS application_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.application_stage_history DROP CONSTRAINT IF EXISTS application_stage_history_pkey;
ALTER TABLE IF EXISTS ONLY public.application DROP CONSTRAINT IF EXISTS application_serial_key;
ALTER TABLE IF EXISTS ONLY public.application_response DROP CONSTRAINT IF EXISTS application_response_pkey;
ALTER TABLE IF EXISTS ONLY public.application DROP CONSTRAINT IF EXISTS application_pkey;
ALTER TABLE IF EXISTS ONLY public.application_note DROP CONSTRAINT IF EXISTS application_note_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_log DROP CONSTRAINT IF EXISTS activity_log_pkey;
ALTER TABLE IF EXISTS ONLY public.action_queue DROP CONSTRAINT IF EXISTS action_queue_pkey;
ALTER TABLE IF EXISTS ONLY public.action_plugin DROP CONSTRAINT IF EXISTS action_plugin_pkey;
ALTER TABLE IF EXISTS ONLY public.action_plugin DROP CONSTRAINT IF EXISTS action_plugin_code_key;
ALTER TABLE IF EXISTS public.verification ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.user_organisation ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."user" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.trigger_schedule ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.trigger_queue ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_stage_review_level ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_stage ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_section ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_permission ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_filter_join ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_element ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_category ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template_action ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.template ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.system_info ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_response ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_decision ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_assignment_assigner_join ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review_assignment ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.review ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permission_policy ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permission_name ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.permission_join ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organisation ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notification ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.filter ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.file ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.data_view_column_definition ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.data_view ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.data_table ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.counter ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.application_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.application_stage_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.application_response ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.application_note ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.application ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_log ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.action_queue ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.action_plugin ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.verification_id_seq;
DROP TABLE IF EXISTS public.verification;
DROP SEQUENCE IF EXISTS public.user_organisation_id_seq;
DROP VIEW IF EXISTS public.user_org_join;
DROP TABLE IF EXISTS public.user_organisation;
DROP SEQUENCE IF EXISTS public.user_id_seq;
DROP SEQUENCE IF EXISTS public.trigger_schedule_id_seq;
DROP TABLE IF EXISTS public.trigger_schedule;
DROP SEQUENCE IF EXISTS public.trigger_queue_id_seq;
DROP TABLE IF EXISTS public.trigger_queue;
DROP SEQUENCE IF EXISTS public.template_stage_review_level_id_seq;
DROP TABLE IF EXISTS public.template_stage_review_level;
DROP SEQUENCE IF EXISTS public.template_stage_id_seq;
DROP SEQUENCE IF EXISTS public.template_section_id_seq;
DROP TABLE IF EXISTS public.template_section;
DROP SEQUENCE IF EXISTS public.template_permission_id_seq;
DROP SEQUENCE IF EXISTS public.template_id_seq;
DROP SEQUENCE IF EXISTS public.template_filter_join_id_seq;
DROP TABLE IF EXISTS public.template_filter_join;
DROP SEQUENCE IF EXISTS public.template_element_id_seq;
DROP SEQUENCE IF EXISTS public.template_category_id_seq;
DROP SEQUENCE IF EXISTS public.template_action_id_seq;
DROP SEQUENCE IF EXISTS public.system_info_id_seq;
DROP TABLE IF EXISTS public.system_info;
DROP VIEW IF EXISTS public.schema_columns;
DROP SEQUENCE IF EXISTS public.review_status_history_id_seq;
DROP TABLE IF EXISTS public.review_status_history;
DROP SEQUENCE IF EXISTS public.review_response_id_seq;
DROP TABLE IF EXISTS public.review_response;
DROP SEQUENCE IF EXISTS public.review_id_seq;
DROP SEQUENCE IF EXISTS public.review_decision_id_seq;
DROP SEQUENCE IF EXISTS public.review_assignment_id_seq;
DROP SEQUENCE IF EXISTS public.review_assignment_assigner_join_id_seq;
DROP TABLE IF EXISTS public.review_assignment_assigner_join;
DROP VIEW IF EXISTS public.postgres_row_level;
DROP VIEW IF EXISTS public.permissions_all;
DROP TABLE IF EXISTS public."user";
DROP TABLE IF EXISTS public.template_permission;
DROP TABLE IF EXISTS public.template_category;
DROP SEQUENCE IF EXISTS public.permission_policy_id_seq;
DROP TABLE IF EXISTS public.permission_policy;
DROP SEQUENCE IF EXISTS public.permission_name_id_seq;
DROP TABLE IF EXISTS public.permission_name;
DROP SEQUENCE IF EXISTS public.permission_join_id_seq;
DROP TABLE IF EXISTS public.permission_join;
DROP SEQUENCE IF EXISTS public.organisation_id_seq;
DROP TABLE IF EXISTS public.organisation;
DROP SEQUENCE IF EXISTS public.notification_id_seq;
DROP TABLE IF EXISTS public.notification;
DROP SEQUENCE IF EXISTS public.filter_id_seq;
DROP TABLE IF EXISTS public.filter;
DROP SEQUENCE IF EXISTS public.file_id_seq;
DROP TABLE IF EXISTS public.file;
DROP TABLE IF EXISTS public.element_type_plugin;
DROP SEQUENCE IF EXISTS public.data_view_id_seq;
DROP SEQUENCE IF EXISTS public.data_view_column_definition_id_seq;
DROP TABLE IF EXISTS public.data_view_column_definition;
DROP TABLE IF EXISTS public.data_view;
DROP SEQUENCE IF EXISTS public.data_table_id_seq;
DROP TABLE IF EXISTS public.data_table;
DROP SEQUENCE IF EXISTS public.counter_id_seq;
DROP TABLE IF EXISTS public.counter;
DROP VIEW IF EXISTS public.constraints_info;
DROP SEQUENCE IF EXISTS public.application_status_history_id_seq;
DROP VIEW IF EXISTS public.application_stage_status_latest;
DROP VIEW IF EXISTS public.application_stage_status_all;
DROP TABLE IF EXISTS public.template_stage;
DROP TABLE IF EXISTS public.template;
DROP TABLE IF EXISTS public.application_status_history;
DROP SEQUENCE IF EXISTS public.application_stage_history_id_seq;
DROP TABLE IF EXISTS public.application_stage_history;
DROP SEQUENCE IF EXISTS public.application_response_id_seq;
DROP TABLE IF EXISTS public.application_response;
DROP SEQUENCE IF EXISTS public.application_note_id_seq;
DROP TABLE IF EXISTS public.application_note;
DROP SEQUENCE IF EXISTS public.application_id_seq;
DROP SEQUENCE IF EXISTS public.activity_log_id_seq;
DROP TABLE IF EXISTS public.activity_log;
DROP SEQUENCE IF EXISTS public.action_queue_id_seq;
DROP TABLE IF EXISTS public.action_queue;
DROP SEQUENCE IF EXISTS public.action_plugin_id_seq;
DROP TABLE IF EXISTS public.action_plugin;
DROP FUNCTION IF EXISTS public.update_review_response_timestamp();
DROP FUNCTION IF EXISTS public.update_response_timestamp();
DROP FUNCTION IF EXISTS public.template_status_update();
DROP FUNCTION IF EXISTS public.template_element_parameters_string(template_element public.template_element);
DROP TABLE IF EXISTS public.template_element;
DROP FUNCTION IF EXISTS public.template_action_parameters_queries_string(template_action public.template_action);
DROP TABLE IF EXISTS public.template_action;
DROP FUNCTION IF EXISTS public.submitted_assigned_questions_count(app_id integer, stage_id integer, level_number integer);
DROP FUNCTION IF EXISTS public.status_is_current_update();
DROP FUNCTION IF EXISTS public.status_activity_log();
DROP FUNCTION IF EXISTS public.stage_is_current_update();
DROP FUNCTION IF EXISTS public.stage_activity_log();
DROP FUNCTION IF EXISTS public.set_template_verision();
DROP FUNCTION IF EXISTS public.set_template_to_draft();
DROP FUNCTION IF EXISTS public.set_original_response();
DROP FUNCTION IF EXISTS public.set_latest_review_response();
DROP FUNCTION IF EXISTS public.reviewable_questions_count(app_id integer);
DROP FUNCTION IF EXISTS public.reviewable_questions(app_id integer);
DROP FUNCTION IF EXISTS public.review_time_status_created(app public.review);
DROP FUNCTION IF EXISTS public.review_status_history_is_current_update();
DROP FUNCTION IF EXISTS public.review_status_activity_log();
DROP FUNCTION IF EXISTS public.review_status(app public.review);
DROP FUNCTION IF EXISTS public.review_response_stage_number(review_id integer);
DROP FUNCTION IF EXISTS public.review_list(stageid integer, reviewerid integer, appstatus public.application_status);
DROP FUNCTION IF EXISTS public.review_latest_decision(review public.review);
DROP TABLE IF EXISTS public.review_decision;
DROP FUNCTION IF EXISTS public.review_is_locked(review public.review);
DROP TABLE IF EXISTS public.review;
DROP FUNCTION IF EXISTS public.review_time_stage_created(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_stage(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_reviewer_id(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_level(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_is_last_stage(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_is_last_level(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_is_final_decision(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.review_decision_activity_log();
DROP FUNCTION IF EXISTS public.review_assignment_available_sections(assignment public.review_assignment);
DROP TABLE IF EXISTS public.review_assignment;
DROP FUNCTION IF EXISTS public.review_assignment_template_id(application_id integer);
DROP FUNCTION IF EXISTS public.review_application_id(review_assignment_id integer);
DROP FUNCTION IF EXISTS public.permission_activity_log();
DROP FUNCTION IF EXISTS public.outcome_reverted();
DROP FUNCTION IF EXISTS public.outcome_changed();
DROP FUNCTION IF EXISTS public.outcome_activity_log();
DROP FUNCTION IF EXISTS public.notify_trigger_queue();
DROP FUNCTION IF EXISTS public.notify_file_server();
DROP FUNCTION IF EXISTS public.notify_action_queue();
DROP FUNCTION IF EXISTS public.mark_file_for_deletion();
DROP FUNCTION IF EXISTS public.jwt_get_text(jwt_key text);
DROP FUNCTION IF EXISTS public.jwt_get_boolean(jwt_key text);
DROP FUNCTION IF EXISTS public.jwt_get_bigint(jwt_key text);
DROP FUNCTION IF EXISTS public.get_template_version(section_id integer);
DROP FUNCTION IF EXISTS public.get_template_code(section_id integer);
DROP FUNCTION IF EXISTS public.enforce_asssigned_section_validity();
DROP FUNCTION IF EXISTS public.delete_whole_application(application_id integer);
DROP FUNCTION IF EXISTS public.deadline_extension_activity_log();
DROP FUNCTION IF EXISTS public.assignment_list(stageid integer);
DROP FUNCTION IF EXISTS public.assignment_activity_log();
DROP FUNCTION IF EXISTS public.assigner_list(stage_id integer, assigner_id integer);
DROP FUNCTION IF EXISTS public.assigned_questions_count(app_id integer, stage_id integer, level_number integer);
DROP FUNCTION IF EXISTS public.assigned_questions(app_id integer, stage_id integer, level_number integer);
DROP FUNCTION IF EXISTS public.application_status_history_application_id(application_stage_history_id integer);
DROP FUNCTION IF EXISTS public.application_status(a public.application);
DROP FUNCTION IF EXISTS public.application_stage_number(app public.application);
DROP FUNCTION IF EXISTS public.application_stage(app public.application);
DROP TABLE IF EXISTS public.application;
DROP FUNCTION IF EXISTS public.application_list_filter_stage(template_code character varying);
DROP FUNCTION IF EXISTS public.application_list_filter_reviewer(reviewer character varying, template_code character varying);
DROP FUNCTION IF EXISTS public.application_list_filter_organisation(organisation character varying, template_code character varying);
DROP FUNCTION IF EXISTS public.application_list_filter_assigner(assigner character varying, template_code character varying);
DROP FUNCTION IF EXISTS public.application_list_filter_applicant(applicant character varying, template_code character varying);
DROP FUNCTION IF EXISTS public.application_list(userid integer);
DROP TABLE IF EXISTS public.application_list_shape;
DROP FUNCTION IF EXISTS public.add_event_to_trigger_queue();
DROP FUNCTION IF EXISTS postgraphile_watch.notify_watchers_drop();
DROP FUNCTION IF EXISTS postgraphile_watch.notify_watchers_ddl();
DROP TYPE IF EXISTS public.ui_location;
DROP TYPE IF EXISTS public.trigger_queue_status;
DROP TYPE IF EXISTS public.trigger;
DROP TYPE IF EXISTS public.template_status;
DROP TYPE IF EXISTS public.template_element_category;
DROP TYPE IF EXISTS public.reviewer_action;
DROP TYPE IF EXISTS public.reviewability;
DROP TYPE IF EXISTS public.review_status;
DROP TYPE IF EXISTS public.review_response_status;
DROP TYPE IF EXISTS public.review_response_recommended_applicant_visibility;
DROP TYPE IF EXISTS public.review_response_decision;
DROP TYPE IF EXISTS public.review_assignment_status;
DROP TYPE IF EXISTS public.permission_policy_type;
DROP TYPE IF EXISTS public.event_type;
DROP TYPE IF EXISTS public.decision;
DROP TYPE IF EXISTS public.assigner_action;
DROP TYPE IF EXISTS public.application_status;
DROP TYPE IF EXISTS public.application_response_status;
DROP TYPE IF EXISTS public.application_outcome;
DROP TYPE IF EXISTS public.action_queue_status;
DROP EXTENSION IF EXISTS citext;
DROP SCHEMA IF EXISTS postgraphile_watch;
--
-- Name: postgraphile_watch; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA postgraphile_watch;


ALTER SCHEMA postgraphile_watch OWNER TO postgres;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: action_queue_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.action_queue_status AS ENUM (
    'QUEUED',
    'PROCESSING',
    'SUCCESS',
    'FAIL',
    'CONDITION_NOT_MET'
);


ALTER TYPE public.action_queue_status OWNER TO postgres;

--
-- Name: application_outcome; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.application_outcome AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'WITHDRAWN'
);


ALTER TYPE public.application_outcome OWNER TO postgres;

--
-- Name: application_response_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.application_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);


ALTER TYPE public.application_response_status OWNER TO postgres;

--
-- Name: application_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.application_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'CHANGES_REQUIRED',
    'RE_SUBMITTED',
    'COMPLETED'
);


ALTER TYPE public.application_status OWNER TO postgres;

--
-- Name: assigner_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assigner_action AS ENUM (
    'ASSIGN',
    'RE_ASSIGN'
);


ALTER TYPE public.assigner_action OWNER TO postgres;

--
-- Name: decision; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.decision AS ENUM (
    'LIST_OF_QUESTIONS',
    'CONFORM',
    'NON_CONFORM',
    'CHANGES_REQUESTED',
    'NO_DECISION'
);


ALTER TYPE public.decision OWNER TO postgres;

--
-- Name: event_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_type AS ENUM (
    'STAGE',
    'STATUS',
    'OUTCOME',
    'EXTENSION',
    'ASSIGNMENT',
    'REVIEW',
    'REVIEW_DECISION',
    'PERMISSION'
);


ALTER TYPE public.event_type OWNER TO postgres;

--
-- Name: permission_policy_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.permission_policy_type AS ENUM (
    'REVIEW',
    'APPLY',
    'ASSIGN',
    'VIEW'
);


ALTER TYPE public.permission_policy_type OWNER TO postgres;

--
-- Name: review_assignment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_assignment_status AS ENUM (
    'AVAILABLE',
    'ASSIGNED'
);


ALTER TYPE public.review_assignment_status OWNER TO postgres;

--
-- Name: review_response_decision; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_response_decision AS ENUM (
    'APPROVE',
    'DECLINE',
    'AGREE',
    'DISAGREE'
);


ALTER TYPE public.review_response_decision OWNER TO postgres;

--
-- Name: review_response_recommended_applicant_visibility; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_response_recommended_applicant_visibility AS ENUM (
    'ORIGINAL_RESPONSE_VISIBLE_TO_APPLICANT',
    'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT'
);


ALTER TYPE public.review_response_recommended_applicant_visibility OWNER TO postgres;

--
-- Name: review_response_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);


ALTER TYPE public.review_response_status OWNER TO postgres;

--
-- Name: review_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'CHANGES_REQUESTED',
    'PENDING',
    'DISCONTINUED'
);


ALTER TYPE public.review_status OWNER TO postgres;

--
-- Name: reviewability; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reviewability AS ENUM (
    'ALWAYS',
    'NEVER',
    'ONLY_IF_APPLICANT_ANSWER',
    'OPTIONAL_IF_NO_RESPONSE'
);


ALTER TYPE public.reviewability OWNER TO postgres;

--
-- Name: reviewer_action; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reviewer_action AS ENUM (
    'SELF_ASSIGN',
    'START_REVIEW',
    'VIEW_REVIEW',
    'CONTINUE_REVIEW',
    'MAKE_DECISION',
    'RESTART_REVIEW',
    'UPDATE_REVIEW',
    'AWAITING_RESPONSE'
);


ALTER TYPE public.reviewer_action OWNER TO postgres;

--
-- Name: template_element_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.template_element_category AS ENUM (
    'QUESTION',
    'INFORMATION'
);


ALTER TYPE public.template_element_category OWNER TO postgres;

--
-- Name: template_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.template_status AS ENUM (
    'DRAFT',
    'AVAILABLE',
    'DISABLED'
);


ALTER TYPE public.template_status OWNER TO postgres;

--
-- Name: trigger; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trigger AS ENUM (
    'ON_APPLICATION_CREATE',
    'ON_APPLICATION_RESTART',
    'ON_APPLICATION_SUBMIT',
    'ON_APPLICATION_SAVE',
    'ON_APPLICATION_WITHDRAW',
    'ON_REVIEW_CREATE',
    'ON_REVIEW_SUBMIT',
    'ON_REVIEW_RESTART',
    'ON_REVIEW_ASSIGN',
    'ON_REVIEW_UNASSIGN',
    'ON_APPROVAL_SUBMIT',
    'ON_VERIFICATION',
    'ON_SCHEDULE',
    'ON_PREVIEW',
    'ON_EXTEND',
    'DEV_TEST',
    'PROCESSING',
    'ERROR'
);


ALTER TYPE public.trigger OWNER TO postgres;

--
-- Name: trigger_queue_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trigger_queue_status AS ENUM (
    'TRIGGERED',
    'ACTIONS_DISPATCHED',
    'ERROR',
    'COMPLETED'
);


ALTER TYPE public.trigger_queue_status OWNER TO postgres;

--
-- Name: ui_location; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ui_location AS ENUM (
    'DASHBOARD',
    'LIST',
    'USER',
    'ADMIN',
    'MANAGEMENT'
);


ALTER TYPE public.ui_location OWNER TO postgres;

--
-- Name: notify_watchers_ddl(); Type: FUNCTION; Schema: postgraphile_watch; Owner: postgres
--

CREATE FUNCTION postgraphile_watch.notify_watchers_ddl() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'ddl',
      'payload',
      (select json_agg(json_build_object('schema', schema_name, 'command', command_tag)) from pg_event_trigger_ddl_commands() as x)
    )::text
  );
end;
$$;


ALTER FUNCTION postgraphile_watch.notify_watchers_ddl() OWNER TO postgres;

--
-- Name: notify_watchers_drop(); Type: FUNCTION; Schema: postgraphile_watch; Owner: postgres
--

CREATE FUNCTION postgraphile_watch.notify_watchers_drop() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
begin
  perform pg_notify(
    'postgraphile_watch',
    json_build_object(
      'type',
      'drop',
      'payload',
      (select json_agg(distinct x.schema_name) from pg_event_trigger_dropped_objects() as x)
    )::text
  );
end;
$$;


ALTER FUNCTION postgraphile_watch.notify_watchers_drop() OWNER TO postgres;

--
-- Name: add_event_to_trigger_queue(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_event_to_trigger_queue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    --
    IF TG_TABLE_NAME = 'trigger_schedule' OR TG_TABLE_NAME = 'verification' THEN
        INSERT INTO trigger_queue (trigger_type, "table", record_id, event_code, data, timestamp, status)
            VALUES (NEW.trigger::public.trigger, TG_TABLE_NAME, NEW.id, NEW.event_code, NEW.data, CURRENT_TIMESTAMP, 'TRIGGERED');
        EXECUTE format('UPDATE %s SET trigger = %L WHERE id = %s', TG_TABLE_NAME, 'PROCESSING', NEW.id);
        RETURN NULL;
    ELSE
        INSERT INTO trigger_queue (trigger_type, "table", record_id, timestamp, status)
            VALUES (NEW.trigger::public.trigger, TG_TABLE_NAME, NEW.id, CURRENT_TIMESTAMP, 'TRIGGERED');
        EXECUTE format('UPDATE %s SET trigger = %L WHERE id = %s', TG_TABLE_NAME, 'PROCESSING', NEW.id);
        RETURN NULL;
    END IF;
END;
$$;


ALTER FUNCTION public.add_event_to_trigger_queue() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: application_list_shape; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_list_shape (
    id integer,
    serial character varying,
    name character varying,
    template_code character varying,
    template_name character varying,
    applicant character varying,
    org_name character varying,
    stage character varying,
    stage_colour character varying,
    status public.application_status,
    outcome public.application_outcome,
    last_active_date timestamp with time zone,
    applicant_deadline timestamp with time zone,
    assigners character varying[],
    reviewers character varying[],
    reviewer_action public.reviewer_action,
    assigner_action public.assigner_action
);


ALTER TABLE public.application_list_shape OWNER TO postgres;

--
-- Name: application_list(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_list(userid integer DEFAULT 0) RETURNS SETOF public.application_list_shape
    LANGUAGE sql STABLE
    AS $_$
    SELECT
        app.id,
        app.serial,
        app.name,
        template.code AS template_code,
        template.name AS template_name,
        CONCAT(first_name, ' ', last_name) AS applicant,
        org.name AS org_name,
        stage_status.stage,
        stage_status.stage_colour,
        stage_status.status,
        app.outcome,
        status_history_time_created AS last_active_date,
        ts.time_scheduled AS applicant_deadline,
        assigners,
        reviewers,
        reviewer_action,
        assigner_action
    FROM
        public.application app
    LEFT JOIN public.template ON app.template_id = template.id
    LEFT JOIN public."user" ON user_id = "user".id
    LEFT JOIN public.application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
    LEFT JOIN public.organisation org ON app.org_id = org.id
    LEFT JOIN assignment_list (stage_status.stage_id) ON app.id = assignment_list.application_id
    LEFT JOIN review_list (stage_status.stage_id, $1, stage_status.status) ON app.id = review_list.application_id
    LEFT JOIN assigner_list (stage_status.stage_id, $1) ON app.id = assigner_list.application_id
    LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
        AND ts.is_active = TRUE
        AND ts.event_code = 'applicantDeadline'
WHERE
    app.is_config = FALSE
$_$;


ALTER FUNCTION public.application_list(userid integer) OWNER TO postgres;

--
-- Name: FUNCTION application_list(userid integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.application_list(userid integer) IS '@sortable';


--
-- Name: application_list_filter_applicant(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_list_filter_applicant(applicant character varying, template_code character varying) RETURNS TABLE(applicant character varying)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT
        (applicant)
    FROM
        application_list ()
    WHERE
        applicant ILIKE CONCAT('%', $1, '%')
        AND template_code = $2
$_$;


ALTER FUNCTION public.application_list_filter_applicant(applicant character varying, template_code character varying) OWNER TO postgres;

--
-- Name: application_list_filter_assigner(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_list_filter_assigner(assigner character varying, template_code character varying) RETURNS TABLE(assigner character varying)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT
        assigners_unset
    FROM
        application_list (),
        unnest(assigners) assigners_unset
WHERE
    assigners_unset ILIKE CONCAT('%', $1, '%')
    AND template_code = $2
$_$;


ALTER FUNCTION public.application_list_filter_assigner(assigner character varying, template_code character varying) OWNER TO postgres;

--
-- Name: application_list_filter_organisation(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_list_filter_organisation(organisation character varying, template_code character varying) RETURNS TABLE(organisation character varying)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT
        (org_name)
    FROM
        application_list ()
    WHERE
        org_name ILIKE CONCAT('%', $1, '%')
        AND template_code = $2
$_$;


ALTER FUNCTION public.application_list_filter_organisation(organisation character varying, template_code character varying) OWNER TO postgres;

--
-- Name: application_list_filter_reviewer(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_list_filter_reviewer(reviewer character varying, template_code character varying) RETURNS TABLE(reviewer character varying)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT
        reviewers_unset
    FROM
        application_list (),
        unnest(reviewers) reviewers_unset
WHERE
    reviewers_unset ILIKE CONCAT('%', $1, '%')
    AND template_code = $2
$_$;


ALTER FUNCTION public.application_list_filter_reviewer(reviewer character varying, template_code character varying) OWNER TO postgres;

--
-- Name: application_list_filter_stage(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_list_filter_stage(template_code character varying) RETURNS TABLE(stage character varying)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT
        (stage)
    FROM
        application_list ()
    WHERE
        template_code = $1
$_$;


ALTER FUNCTION public.application_list_filter_stage(template_code character varying) OWNER TO postgres;

--
-- Name: application; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application (
    id integer NOT NULL,
    template_id integer NOT NULL,
    user_id integer,
    org_id integer,
    session_id character varying,
    serial character varying,
    name character varying,
    outcome public.application_outcome DEFAULT 'PENDING'::public.application_outcome,
    is_active boolean,
    is_config boolean DEFAULT false,
    trigger public.trigger
);


ALTER TABLE public.application OWNER TO postgres;

--
-- Name: application_stage(public.application); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_stage(app public.application) RETURNS character varying
    LANGUAGE sql STABLE
    AS $$
    SELECT
        stage
    FROM (
        SELECT
            application_id,
            stage
        FROM
            public.application_stage_status_latest) AS app_stage
WHERE
    app_stage.application_id = app.id;

$$;


ALTER FUNCTION public.application_stage(app public.application) OWNER TO postgres;

--
-- Name: application_stage_number(public.application); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_stage_number(app public.application) RETURNS integer
    LANGUAGE sql STABLE
    AS $$
    SELECT
        stage_number
    FROM (
        SELECT
            application_id,
            stage_number
        FROM
            public.application_stage_status_latest) AS app_stage_num
WHERE
    app_stage_num.application_id = app.id;

$$;


ALTER FUNCTION public.application_stage_number(app public.application) OWNER TO postgres;

--
-- Name: application_status(public.application); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_status(a public.application) RETURNS public.application_status
    LANGUAGE sql STABLE
    AS $$
    SELECT
        status
    FROM (
        SELECT
            application_id,
            status
        FROM
            public.application_stage_status_latest) AS app_status
WHERE
    app_status.application_id = a.id;

$$;


ALTER FUNCTION public.application_status(a public.application) OWNER TO postgres;

--
-- Name: application_status_history_application_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.application_status_history_application_id(application_stage_history_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        application_id
    FROM
        public.application_stage_history
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.application_status_history_application_id(application_stage_history_id integer) OWNER TO postgres;

--
-- Name: assigned_questions(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assigned_questions(app_id integer, stage_id integer, level_number integer) RETURNS TABLE(review_id integer, response_id integer, review_assignment_id integer, review_response_code character varying, review_response_status public.review_response_status, decision public.review_response_decision, is_optional boolean, is_lastest_review boolean)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT ON (review_response_code)
        rr.review_id,
        rq.response_id,
        ra.id AS review_assignment_id,
        rq.code AS review_response_code,
        rr.status AS review_response_status,
        rr.decision,
        rq.is_optional,
        rr.is_latest_review
    FROM (
        SELECT
            id,
            application_id,
            stage_id,
            level_number,
            status,
            UNNEST(assigned_sections) AS section_code
        FROM
            public.review_assignment) ra
    JOIN public.template_section ts ON ra.section_code = ts.code
    JOIN public.template_element te ON ts.id = te.section_id
    JOIN public.reviewable_questions (app_id) rq ON rq.code = te.code
    LEFT JOIN public.review ON review.review_assignment_id = ra.id
    LEFT JOIN public.review_response rr ON (rr.application_response_id = rq.response_id
            AND rr.review_id = review.id)
WHERE
    ra.application_id = $1
    AND ra.stage_id = $2
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
GROUP BY
    ra.id,
    rr.review_id,
    rr.is_latest_review,
    rq.is_optional,
    rr.status,
    rr.decision,
    rq.code,
    rq.response_id
ORDER BY
    review_response_code,
    is_latest_review DESC
$_$;


ALTER FUNCTION public.assigned_questions(app_id integer, stage_id integer, level_number integer) OWNER TO postgres;

--
-- Name: assigned_questions_count(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assigned_questions_count(app_id integer, stage_id integer, level_number integer) RETURNS bigint
    LANGUAGE sql STABLE
    AS $$
    SELECT
        COUNT(*)
    FROM
        assigned_questions (app_id, stage_id, level_number)
$$;


ALTER FUNCTION public.assigned_questions_count(app_id integer, stage_id integer, level_number integer) OWNER TO postgres;

--
-- Name: assigner_list(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assigner_list(stage_id integer, assigner_id integer) RETURNS TABLE(application_id integer, assigner_action public.assigner_action)
    LANGUAGE sql STABLE
    AS $_$
    SELECT
        review_assignment.application_id AS application_id,
        CASE WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) >= reviewable_questions_count (application_id)
            AND submitted_assigned_questions_count (application_id, $1, level_number) < assigned_questions_count (application_id, $1, level_number) THEN
            'RE_ASSIGN'
        WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) < reviewable_questions_count (application_id) THEN
            'ASSIGN'
        ELSE
            NULL
        END::assigner_action
    FROM
        public.review_assignment
    LEFT JOIN public.review_assignment_assigner_join ON review_assignment.id = review_assignment_assigner_join.review_assignment_id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment_assigner_join.assigner_id = $2
    AND (
        SELECT
            outcome
        FROM
            public.application
        WHERE
            id = review_assignment.application_id) = 'PENDING'
GROUP BY
    review_assignment.application_id,
    review_assignment.level_number;

$_$;


ALTER FUNCTION public.assigner_list(stage_id integer, assigner_id integer) OWNER TO postgres;

--
-- Name: assignment_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assignment_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('ASSIGNMENT', (
                CASE WHEN NEW.status = 'ASSIGNED'
                    AND NEW.reviewer_id = NEW.assigner_id THEN
                    'Self-Assigned'
                WHEN NEW.status = 'ASSIGNED'
                    AND NEW.reviewer_id <> NEW.assigner_id THEN
                    'Assigned'
                WHEN NEW.status = 'AVAILABLE' THEN
                    'Unassigned'
                ELSE
                    'ERROR'
                END), NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('status', NEW.status, 'reviewer', json_build_object('id', NEW.reviewer_id, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
                        WHERE
                            id = NEW.reviewer_id), 'orgId', NEW.organisation_id, 'orgName', (
                            SELECT
                                name
                            FROM public.organisation
                            WHERE
                                id = NEW.organisation_id)), 'assigner', json_build_object('id', NEW.assigner_id, 'name', (
                                SELECT
                                    full_name
                                FROM public."user"
                                WHERE
                                    id = NEW.assigner_id)), 'stage', json_build_object('number', NEW.stage_number, 'name', (
                                    SELECT
                                        title
                                    FROM public.template_stage
                                    WHERE
                                        id = NEW.stage_id)), 'sections', COALESCE((
                                    SELECT
                                        json_agg(t)
                                    FROM (
                                        SELECT
                                            title, code, "index"
                                        FROM public.template_section
                                    WHERE
                                        code = ANY (ARRAY (
                                                SELECT
                                                    assigned_sections
                                                FROM public.review_assignment
                                            WHERE
                                                id = NEW.id))
                                        AND template_id = NEW.template_id
                                        AND NEW.assigned_sections <> '{}' ORDER BY "index") t), (
                                    SELECT
                                        json_agg(t)
                                    FROM (
                                        SELECT
                                            title, code, "index"
                                        FROM public.template_section
                                    WHERE
                                        code = ANY (OLD.assigned_sections)
                                        AND template_id = NEW.template_id ORDER BY "index") t)), 'reviewLevel', NEW.level_number));
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.assignment_activity_log() OWNER TO postgres;

--
-- Name: assignment_list(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assignment_list(stageid integer) RETURNS TABLE(application_id integer, reviewers character varying[], assigners character varying[])
    LANGUAGE sql STABLE
    AS $_$
    SELECT
        review_assignment.application_id,
        ARRAY_AGG(DISTINCT (CONCAT(reviewer_user.first_name, ' ', reviewer_user.last_name)::varchar)) AS reviewers,
        ARRAY_AGG(DISTINCT (CONCAT(assigner_user.first_name, ' ', assigner_user.last_name)::varchar)) AS assigners
    FROM
        public.review_assignment
    LEFT JOIN public."user" AS assigner_user ON review_assignment.assigner_id = assigner_user.id
    LEFT JOIN public."user" AS reviewer_user ON review_assignment.reviewer_id = reviewer_user.id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment.status = 'ASSIGNED'
    -- WHERE assigner_user IS NOT NULL
GROUP BY
    review_assignment.application_id;

$_$;


ALTER FUNCTION public.assignment_list(stageid integer) OWNER TO postgres;

--
-- Name: deadline_extension_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.deadline_extension_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('EXTENSION', NEW.event_code, NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('newDeadline', NEW.time_scheduled, 'extendedBy', json_build_object('userId', NEW.editor_user_id, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
                        WHERE
                            id = NEW.editor_user_id))));
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.deadline_extension_activity_log() OWNER TO postgres;

--
-- Name: delete_whole_application(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_whole_application(application_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$
BEGIN
    DELETE FROM public.application_status_history
    WHERE application_stage_history_id IN (
            SELECT
                id
            FROM
                public.application_stage_history
            WHERE
                application_stage_history.application_id = $1);
    DELETE FROM public.application_stage_history
    WHERE application_stage_history.application_id = $1;
    DELETE FROM public.application_response
    WHERE application_response.application_id = $1;
    DELETE FROM public.application_section
    WHERE application_section.application_id = $1;
    DELETE FROM public.application
    WHERE application.id = $1;
    RETURN TRUE;
END;
$_$;


ALTER FUNCTION public.delete_whole_application(application_id integer) OWNER TO postgres;

--
-- Name: enforce_asssigned_section_validity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.enforce_asssigned_section_validity() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.status = 'AVAILABLE' THEN
        NEW.assigned_sections = '{}';
    ELSE
        NEW.assigned_sections = ARRAY ( WITH a AS (
                SELECT
                    unnest(NEW.assigned_sections) new_assigned
)
                SELECT
                    new_assigned
                FROM
                    a
                WHERE
                    new_assigned NOT IN (
                        SELECT
                            unnest(assigned_sections)
                        FROM
                            review_assignment
                        WHERE
                            application_id = NEW.application_id
                            AND stage_id = NEW.stage_id
                            AND level_number = NEW.level_number
                            AND reviewer_id <> NEW.reviewer_id)
                        AND (new_assigned = ANY (NEW.allowed_sections)
                            OR NEW.allowed_sections IS NULL));
    END IF;
    IF NEW.assigned_sections = '{}' THEN
        NEW.status = 'AVAILABLE';
    END IF;
    NEW.time_updated = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.enforce_asssigned_section_validity() OWNER TO postgres;

--
-- Name: get_template_code(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_template_code(section_id integer) RETURNS character varying
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        template.code
    FROM
        public.template
        JOIN public.template_section ON template_id = template.id
    WHERE
        template_section.id = $1;

$_$;


ALTER FUNCTION public.get_template_code(section_id integer) OWNER TO postgres;

--
-- Name: get_template_version(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_template_version(section_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        template.version
    FROM
        public.template
        JOIN public.template_section ON template_id = template.id
    WHERE
        template_section.id = $1;

$_$;


ALTER FUNCTION public.get_template_version(section_id integer) OWNER TO postgres;

--
-- Name: jwt_get_bigint(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jwt_get_bigint(jwt_key text) RETURNS bigint
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
  IF jwt_get_text ($1) = '' THEN
    RETURN 0;
  ELSE
    RETURN jwt_get_text ($1)::bigint;
  END IF;
END;
$_$;


ALTER FUNCTION public.jwt_get_bigint(jwt_key text) OWNER TO postgres;

--
-- Name: jwt_get_boolean(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jwt_get_boolean(jwt_key text) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
  IF jwt_get_text ($1) = 'true' THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$_$;


ALTER FUNCTION public.jwt_get_boolean(jwt_key text) OWNER TO postgres;

--
-- Name: jwt_get_text(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.jwt_get_text(jwt_key text) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
  SELECT
    COALESCE(current_setting('jwt.claims.' || $1, TRUE)::text, '')
$_$;


ALTER FUNCTION public.jwt_get_text(jwt_key text) OWNER TO postgres;

--
-- Name: mark_file_for_deletion(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_file_for_deletion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.file
    SET
        to_be_deleted = TRUE
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.mark_file_for_deletion() OWNER TO postgres;

--
-- Name: notify_action_queue(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_action_queue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- IF NEW.status = 'QUEUED' THEN
    PERFORM
        pg_notify('action_notifications', json_build_object('id', NEW.id, 'code', NEW.action_code, 'condition_expression', NEW.condition_expression, 'parameter_queries', NEW.parameter_queries)::text);
    -- END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.notify_action_queue() OWNER TO postgres;

--
-- Name: notify_file_server(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_file_server() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM
        pg_notify('file_notifications', json_build_object('id', OLD.id, 'uniqueId', OLD.unique_id, 'originalFilename', OLD.original_filename, 'filePath', OLD.file_path, 'thumbnailPath', OLD.thumbnail_path)::text);
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.notify_file_server() OWNER TO postgres;

--
-- Name: notify_trigger_queue(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_trigger_queue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM
        pg_notify('trigger_notifications', json_build_object('trigger_id', NEW.id, 'trigger', NEW.trigger_type, 'table', NEW.table, 'record_id', NEW.record_id, 'event_code', NEW.event_code)::text);
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.notify_trigger_queue() OWNER TO postgres;

--
-- Name: outcome_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.outcome_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('OUTCOME', NEW.outcome, NEW.id, TG_TABLE_NAME, NEW.id, json_build_object('outcome', NEW.outcome));
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.outcome_activity_log() OWNER TO postgres;

--
-- Name: outcome_changed(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.outcome_changed() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.application
    SET
        is_active = FALSE
    WHERE
        id = NEW.id;
    INSERT INTO public.application_status_history (application_stage_history_id, status)
        VALUES ((
                SELECT
                    id
                FROM
                    public.application_stage_history
                WHERE
                    application_id = NEW.id
                    AND is_current = TRUE),
                'COMPLETED');
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.outcome_changed() OWNER TO postgres;

--
-- Name: outcome_reverted(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.outcome_reverted() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.application
    SET
        is_active = TRUE
    WHERE
        id = NEW.id;
    INSERT INTO public.application_status_history (application_stage_history_id, status)
        VALUES ((
                SELECT
                    id
                FROM
                    public.application_stage_history
                WHERE
                    application_id = NEW.id
                    AND is_current = TRUE),
                (
                    SELECT
                        status
                    FROM
                        public.application_status_history
                    WHERE
                        time_created = (
                            SELECT
                                MAX(time_created)
                            FROM
                                public.application_status_history
                            WHERE
                                is_current = FALSE
                                AND application_id = NEW.id)));
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.outcome_reverted() OWNER TO postgres;

--
-- Name: permission_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.permission_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    user_id integer;
    username varchar;
    org_id integer;
    org_name varchar;
    permission_id integer;
    permission_name varchar;
    active boolean;
    data record;
    status varchar;
BEGIN
    data = CASE WHEN TG_OP = 'DELETE' THEN
        OLD
    ELSE
        NEW
    END;
    status = CASE WHEN TG_OP = 'DELETE' THEN
        'Revoked'
    ELSE
        'Granted'
    END;
    SELECT DISTINCT
        "userId",
        p.username,
        "orgId",
        "orgName",
        "permissionNameId",
        "permissionName",
        "isActive" INTO user_id,
        username,
        org_id,
        org_name,
        permission_id,
        permission_name,
        active
    FROM
        permissions_all p
    WHERE
        "permissionJoinId" = data.id;
    INSERT INTO public.activity_log (type, value, "table", record_id, details)
        VALUES ('PERMISSION', status, TG_TABLE_NAME, data.id, json_build_object('permission', json_build_object('id', permission_id, 'name', permission_name), 'user', json_build_object('id', user_id, 'username', username, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
                        WHERE
                            id = user_id)), 'organisation', json_build_object('id', org_id, 'name', org_name), 'isActive', active));
    RETURN data;
END;
$$;


ALTER FUNCTION public.permission_activity_log() OWNER TO postgres;

--
-- Name: review_application_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_application_id(review_assignment_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        application_id
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_application_id(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_assignment_template_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_assignment_template_id(application_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        template_id
    FROM
        public.application
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_assignment_template_id(application_id integer) OWNER TO postgres;

--
-- Name: review_assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_assignment (
    id integer NOT NULL,
    assigner_id integer,
    reviewer_id integer NOT NULL,
    organisation_id integer,
    stage_id integer NOT NULL,
    stage_number integer,
    time_stage_created timestamp with time zone,
    status public.review_assignment_status NOT NULL,
    application_id integer NOT NULL,
    template_id integer GENERATED ALWAYS AS (public.review_assignment_template_id(application_id)) STORED,
    allowed_sections character varying[],
    assigned_sections character varying[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    trigger public.trigger,
    time_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    level_number integer,
    level_id integer,
    is_last_level boolean,
    is_last_stage boolean,
    is_final_decision boolean DEFAULT false,
    is_self_assignable boolean DEFAULT false
);


ALTER TABLE public.review_assignment OWNER TO postgres;

--
-- Name: review_assignment_available_sections(public.review_assignment); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_assignment_available_sections(assignment public.review_assignment) RETURNS character varying[]
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $_$
    SELECT
        ARRAY ( WITH my_array AS (
                SELECT DISTINCT
                    (ts.code) available_sections
                FROM
                    template_section ts
                    JOIN TEMPLATE t ON t.id = ts.template_id
                    JOIN application a ON a.template_id = t.id
                WHERE
                    a.id = $1.application_id
)
                SELECT
                    available_sections
                FROM
                    my_array
                WHERE
                    available_sections NOT IN (
                        SELECT
                            unnest(assigned_sections)
                        FROM
                            review_assignment
                        WHERE
                            status = 'ASSIGNED'
                            AND stage_id = $1.stage_id
                            AND level_number = $1.level_number
                            AND application_id = $1.application_id)
                        AND (available_sections = ANY ($1.allowed_sections)
                            OR $1.allowed_sections IS NULL))
$_$;


ALTER FUNCTION public.review_assignment_available_sections(assignment public.review_assignment) OWNER TO postgres;

--
-- Name: review_decision_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_decision_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    app_id integer;
    reviewer_id integer;
    rev_assignment_id integer;
    templ_id integer;
BEGIN
    SELECT
        r.application_id,
        r.reviewer_id,
        r.review_assignment_id INTO app_id,
        reviewer_id,
        rev_assignment_id
    FROM
        public.review r
    WHERE
        id = NEW.review_id;
    templ_id = (
        SELECT
            template_id
        FROM
            public.application
        WHERE
            id = app_id);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('REVIEW_DECISION', NEW.decision, app_id, TG_TABLE_NAME, NEW.id, json_build_object('reviewId', NEW.review_id, 'decision', NEW.decision, 'comment', NEW.comment, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
                        WHERE
                            id = reviewer_id)), 'sections', (
                        SELECT
                            json_agg(t)
                        FROM (
                            SELECT
                                title, code, "index"
                            FROM public.template_section
                            WHERE
                                code = ANY (ARRAY (
                                        SELECT
                                            assigned_sections
                                        FROM public.review_assignment
                                    WHERE
                                        id = rev_assignment_id
                                        AND assigned_sections <> '{}'))
                                AND template_id = templ_id ORDER BY "index") t)));
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.review_decision_activity_log() OWNER TO postgres;

--
-- Name: review_is_final_decision(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_is_final_decision(review_assignment_id integer) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        is_final_decision
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_is_final_decision(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_is_last_level(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_is_last_level(review_assignment_id integer) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        is_last_level
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_is_last_level(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_is_last_stage(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_is_last_stage(review_assignment_id integer) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        is_last_stage
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_is_last_stage(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_level(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_level(review_assignment_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        level_number
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_level(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_reviewer_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_reviewer_id(review_assignment_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        reviewer_id
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_reviewer_id(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_stage(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_stage(review_assignment_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        stage_number
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_stage(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review_time_stage_created(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_time_stage_created(review_assignment_id integer) RETURNS timestamp with time zone
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        time_stage_created
    FROM
        public.review_assignment
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_time_stage_created(review_assignment_id integer) OWNER TO postgres;

--
-- Name: review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review (
    id integer NOT NULL,
    review_assignment_id integer,
    trigger public.trigger,
    application_id integer GENERATED ALWAYS AS (public.review_application_id(review_assignment_id)) STORED,
    reviewer_id integer GENERATED ALWAYS AS (public.review_reviewer_id(review_assignment_id)) STORED,
    level_number integer GENERATED ALWAYS AS (public.review_level(review_assignment_id)) STORED,
    stage_number integer GENERATED ALWAYS AS (public.review_stage(review_assignment_id)) STORED,
    time_stage_created timestamp with time zone GENERATED ALWAYS AS (public.review_time_stage_created(review_assignment_id)) STORED,
    is_last_level boolean GENERATED ALWAYS AS (public.review_is_last_level(review_assignment_id)) STORED,
    is_last_stage boolean GENERATED ALWAYS AS (public.review_is_last_stage(review_assignment_id)) STORED,
    is_final_decision boolean GENERATED ALWAYS AS (public.review_is_final_decision(review_assignment_id)) STORED
);


ALTER TABLE public.review OWNER TO postgres;

--
-- Name: review_is_locked(public.review); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_is_locked(review public.review) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    app_status application_status;
BEGIN
    SELECT
        status INTO app_status
    FROM
        application_stage_status_latest
    WHERE
        application_id = $1.application_id;
    IF app_status = 'CHANGES_REQUIRED' OR app_status = 'DRAFT' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$_$;


ALTER FUNCTION public.review_is_locked(review public.review) OWNER TO postgres;

--
-- Name: review_decision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_decision (
    id integer NOT NULL,
    review_id integer NOT NULL,
    decision public.decision DEFAULT 'NO_DECISION'::public.decision,
    comment character varying,
    time_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.review_decision OWNER TO postgres;

--
-- Name: review_latest_decision(public.review); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_latest_decision(review public.review) RETURNS public.review_decision
    LANGUAGE sql STABLE
    AS $$
    SELECT
        *
    FROM
        public.review_decision
    WHERE
        review_id = review.id
    ORDER BY
        time_updated DESC
    LIMIT 1
$$;


ALTER FUNCTION public.review_latest_decision(review public.review) OWNER TO postgres;

--
-- Name: review_list(integer, integer, public.application_status); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_list(stageid integer, reviewerid integer, appstatus public.application_status) RETURNS TABLE(application_id integer, reviewer_action public.reviewer_action)
    LANGUAGE sql STABLE
    AS $_$
    SELECT
        review_assignment.application_id AS application_id,
        CASE WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'CHANGES_REQUESTED') != 0 THEN
            'UPDATE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'PENDING') != 0 THEN
            'RESTART_REVIEW'
        WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'DRAFT'
            AND review_is_locked (review) = FALSE) != 0 THEN
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
            AND review_assignment_available_sections (review_assignment) != '{}'
            AND review.id IS NULL) != 0 THEN
            'SELF_ASSIGN'
        WHEN COUNT(*) FILTER (WHERE (appstatus = 'CHANGES_REQUIRED'
            OR appstatus = 'DRAFT')
            AND review_assignment.status = 'ASSIGNED'
            AND review_status_history.status = 'SUBMITTED') != 0 THEN
            'AWAITING_RESPONSE'
        WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            OR review_status_history.status = 'SUBMITTED') != 0 THEN
            'VIEW_REVIEW'
        ELSE
            NULL
        END::public.reviewer_action
    FROM
        public.review_assignment
    LEFT JOIN public.review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN public.review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
WHERE
    review_assignment.stage_id = $1
    AND review_assignment.reviewer_id = $2
    AND (
        SELECT
            outcome
        FROM
            public.application
        WHERE
            id = review_assignment.application_id) = 'PENDING'
GROUP BY
    review_assignment.application_id;

$_$;


ALTER FUNCTION public.review_list(stageid integer, reviewerid integer, appstatus public.application_status) OWNER TO postgres;

--
-- Name: review_response_stage_number(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_response_stage_number(review_id integer) RETURNS integer
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT
        stage_number
    FROM
        public.review
    WHERE
        id = $1;

$_$;


ALTER FUNCTION public.review_response_stage_number(review_id integer) OWNER TO postgres;

--
-- Name: review_status(public.review); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_status(app public.review) RETURNS public.review_status
    LANGUAGE sql STABLE
    AS $$
    SELECT
        "status"
    FROM
        public.review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$;


ALTER FUNCTION public.review_status(app public.review) OWNER TO postgres;

--
-- Name: review_status_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_status_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    app_id integer;
    reviewer_id integer;
    assignment_id integer;
    stage_number integer;
    prev_status varchar;
    level_num integer;
    is_last_level boolean;
    is_final_decision boolean;
    templ_id integer;
BEGIN
    SELECT
        r.application_id,
        r.reviewer_id,
        r.review_assignment_id,
        r.stage_number,
        r.level_number,
        r.is_last_level,
        r.is_final_decision INTO app_id,
        reviewer_id,
        assignment_id,
        stage_number,
        level_num,
        is_last_level,
        is_final_decision
    FROM
        public.review r
    WHERE
        id = NEW.review_id;
    templ_id = (
        SELECT
            template_id
        FROM
            public.application
        WHERE
            id = app_id);
    prev_status = (
        SELECT
            status
        FROM
            public.review_status_history
        WHERE
            review_id = NEW.review_id
            AND is_current = TRUE);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('REVIEW', NEW.status, app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status, 'reviewId', NEW.review_id, 'reviewer', json_build_object('id', reviewer_id, 'name', (
                        SELECT
                            full_name
                        FROM public."user"
                        WHERE
                            id = reviewer_id), 'stage', json_build_object('number', stage_number, 'name', (
                                SELECT
                                    title
                                FROM public.template_stage
                                WHERE
                                    number = stage_number
                                    AND template_id = templ_id))), 'sections', (
                            SELECT
                                json_agg(t)
                            FROM (
                                SELECT
                                    title, code, "index"
                                FROM public.template_section
                            WHERE
                                code = ANY (ARRAY (
                                        SELECT
                                            assigned_sections
                                        FROM public.review_assignment
                                    WHERE
                                        id = assignment_id
                                        AND template_id = templ_id
                                        AND assigned_sections <> '{}'))
                                AND template_id = templ_id ORDER BY "index") t), 'level', level_num, 'isLastLevel', is_last_level, 'finalDecision', is_final_decision));
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.review_status_activity_log() OWNER TO postgres;

--
-- Name: review_status_history_is_current_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_status_history_is_current_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.review_status_history
    SET
        is_current = FALSE
    WHERE
        review_id = NEW.review_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.review_status_history_is_current_update() OWNER TO postgres;

--
-- Name: review_time_status_created(public.review); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.review_time_status_created(app public.review) RETURNS timestamp with time zone
    LANGUAGE sql STABLE
    AS $$
    SELECT
        time_created
    FROM
        public.review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$;


ALTER FUNCTION public.review_time_status_created(app public.review) OWNER TO postgres;

--
-- Name: reviewable_questions(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reviewable_questions(app_id integer) RETURNS TABLE(code character varying, reviewability public.reviewability, response_id integer, response_value jsonb, is_optional boolean)
    LANGUAGE sql STABLE
    AS $_$
    SELECT DISTINCT ON (code)
        te.code AS code,
        te.reviewability,
        ar.id AS response_id,
        ar.value AS response_value,
        CASE WHEN ar.value IS NULL
            AND te.reviewability = 'OPTIONAL_IF_NO_RESPONSE' THEN
            TRUE
        ELSE
            FALSE
        END::boolean
    FROM
        public.application_response ar
        JOIN public.application app ON ar.application_id = app.id
        JOIN public.template_element te ON ar.template_element_id = te.id
    WHERE
        ar.application_id = $1
        AND te.category = 'QUESTION'
        AND ((ar.value IS NULL
                AND te.reviewability = 'OPTIONAL_IF_NO_RESPONSE')
            OR (ar.value IS NOT NULL
                AND te.reviewability != 'NEVER'))
    GROUP BY
        te.code,
        ar.time_submitted,
        ar.id,
        te,
        reviewability,
        ar.value
    ORDER BY
        code,
        ar.time_submitted DESC
$_$;


ALTER FUNCTION public.reviewable_questions(app_id integer) OWNER TO postgres;

--
-- Name: reviewable_questions_count(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reviewable_questions_count(app_id integer) RETURNS bigint
    LANGUAGE sql STABLE
    AS $$
    SELECT
        COUNT(*)
    FROM
        reviewable_questions (app_id)
$$;


ALTER FUNCTION public.reviewable_questions_count(app_id integer) OWNER TO postgres;

--
-- Name: set_latest_review_response(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_latest_review_response() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.review_response
    SET
        is_latest_review = TRUE
    WHERE
        id = NEW.id;
    UPDATE
        public.review_response
    SET
        is_latest_review = FALSE
    WHERE
        template_element_id = NEW.template_element_id
        AND review_id = NEW.review_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.set_latest_review_response() OWNER TO postgres;

--
-- Name: set_original_response(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_original_response() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.review_response_link_id IS NOT NULL THEN
        NEW.original_review_response_id = (
            SELECT
                original_review_response_id
            FROM
                public.review_response
            WHERE
                id = NEW.review_response_link_id);
        NEW.application_response_id = (
            SELECT
                application_response_id
            FROM
                public.review_response
            WHERE
                id = NEW.review_response_link_id);
    ELSE
        -- should always be original review_response when review_response_link_id IS NULL
        NEW.original_review_response_id = NEW.id;
    END IF;
    -- application_response should always exist
    NEW.template_element_id = (
        SELECT
            template_element_id
        FROM
            public.application_response
        WHERE
            id = NEW.application_response_id);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_original_response() OWNER TO postgres;

--
-- Name: set_template_to_draft(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_template_to_draft() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            public.template
        WHERE
            id != NEW.id AND code = NEW.code AND status = 'AVAILABLE') > 0 THEN
        NEW.status = 'DRAFT';
    END IF;
    RETURN NEW;
END
$$;


ALTER FUNCTION public.set_template_to_draft() OWNER TO postgres;

--
-- Name: set_template_verision(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_template_verision() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            public.template
        WHERE
            id != NEW.id AND code = NEW.code AND version = NEW.version) > 0 THEN
        NEW.version = (
            SELECT
                max(version) + 1
            FROM
                public.template
            WHERE
                code = NEW.code);
        NEW.version_timestamp = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END
$$;


ALTER FUNCTION public.set_template_verision() OWNER TO postgres;

--
-- Name: stage_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stage_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    stage_num integer;
    stage_name varchar;
    stage_col varchar;
BEGIN
    SELECT
        number,
        title,
        colour INTO stage_num,
        stage_name,
        stage_col
    FROM
        public.template_stage
    WHERE
        id = NEW.stage_id;
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('STAGE', stage_name, NEW.application_id, TG_TABLE_NAME, NEW.id, json_build_object('stage', json_build_object('number', stage_num, 'name', stage_name, 'colour', stage_col)));
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.stage_activity_log() OWNER TO postgres;

--
-- Name: stage_is_current_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stage_is_current_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.application_stage_history
    SET
        is_current = FALSE
    WHERE
        application_id = NEW.application_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.stage_is_current_update() OWNER TO postgres;

--
-- Name: status_activity_log(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.status_activity_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    app_id integer;
    prev_status varchar;
BEGIN
    app_id = (
        SELECT
            application_id
        FROM
            public.application_stage_history
        WHERE
            id = NEW.application_stage_history_id);
    prev_status = (
        SELECT
            status
        FROM
            public.application_status_history
        WHERE
            application_id = app_id
            AND is_current = TRUE);
    INSERT INTO public.activity_log (type, value, application_id, "table", record_id, details)
        VALUES ('STATUS', NEW.status, app_id, TG_TABLE_NAME, NEW.id, json_build_object('prevStatus', prev_status, 'status', NEW.status));
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.status_activity_log() OWNER TO postgres;

--
-- Name: status_is_current_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.status_is_current_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.application_status_history
    SET
        is_current = FALSE
    WHERE
        application_id = NEW.application_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.status_is_current_update() OWNER TO postgres;

--
-- Name: submitted_assigned_questions_count(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.submitted_assigned_questions_count(app_id integer, stage_id integer, level_number integer) RETURNS bigint
    LANGUAGE sql STABLE
    AS $$
    SELECT
        COUNT(*)
    FROM
        assigned_questions (app_id, stage_id, level_number) aq
WHERE
    aq.review_response_status = 'SUBMITTED'
$$;


ALTER FUNCTION public.submitted_assigned_questions_count(app_id integer, stage_id integer, level_number integer) OWNER TO postgres;

--
-- Name: template_action; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_action (
    id integer NOT NULL,
    template_id integer NOT NULL,
    code character varying,
    action_code character varying,
    event_code character varying,
    trigger public.trigger,
    condition jsonb DEFAULT 'true'::jsonb,
    parameter_queries jsonb,
    description character varying,
    sequence integer
);


ALTER TABLE public.template_action OWNER TO postgres;

--
-- Name: template_action_parameters_queries_string(public.template_action); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.template_action_parameters_queries_string(template_action public.template_action) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
    SELECT
        parameter_queries::text
    FROM
        public.template_action
    WHERE
        id = $1.id
$_$;


ALTER FUNCTION public.template_action_parameters_queries_string(template_action public.template_action) OWNER TO postgres;

--
-- Name: template_element; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_element (
    id integer NOT NULL,
    section_id integer NOT NULL,
    code character varying NOT NULL,
    index integer,
    title character varying,
    category public.template_element_category,
    element_type_plugin_code character varying,
    visibility_condition jsonb DEFAULT 'true'::jsonb,
    is_required jsonb DEFAULT 'true'::jsonb,
    is_editable jsonb DEFAULT 'true'::jsonb,
    validation jsonb DEFAULT 'true'::jsonb,
    default_value jsonb,
    validation_message character varying,
    help_text character varying,
    parameters jsonb,
    reviewability public.reviewability DEFAULT 'ONLY_IF_APPLICANT_ANSWER'::public.reviewability NOT NULL,
    template_code character varying GENERATED ALWAYS AS (public.get_template_code(section_id)) STORED,
    template_version integer GENERATED ALWAYS AS (public.get_template_version(section_id)) STORED
);


ALTER TABLE public.template_element OWNER TO postgres;

--
-- Name: template_element_parameters_string(public.template_element); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.template_element_parameters_string(template_element public.template_element) RETURNS text
    LANGUAGE sql STABLE
    AS $_$
    SELECT
        parameters::text
    FROM
        public.template_element
    WHERE
        id = $1.id
$_$;


ALTER FUNCTION public.template_element_parameters_string(template_element public.template_element) OWNER TO postgres;

--
-- Name: template_status_update(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.template_status_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (NEW.status = 'AVAILABLE') THEN
        UPDATE
            public.template
        SET
            status = 'DISABLED'
        WHERE
            code = NEW.code
            AND status = 'AVAILABLE'
            AND id != NEW.id;
        UPDATE
            public.file
        SET
            template_id = NEW.id
        WHERE
            template_id IN (
                SELECT
                    id
                FROM
                    TEMPLATE
                WHERE
                    code = NEW.code);
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.template_status_update() OWNER TO postgres;

--
-- Name: update_response_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_response_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.application_response
    SET
        time_updated = NOW()
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_response_timestamp() OWNER TO postgres;

--
-- Name: update_review_response_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_review_response_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE
        public.review_response
    SET
        time_updated = NOW()
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_review_response_timestamp() OWNER TO postgres;

--
-- Name: action_plugin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_plugin (
    id integer NOT NULL,
    code character varying,
    name character varying,
    description character varying,
    path character varying,
    required_parameters character varying[],
    optional_parameters character varying[],
    output_properties character varying[]
);


ALTER TABLE public.action_plugin OWNER TO postgres;

--
-- Name: action_plugin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_plugin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_plugin_id_seq OWNER TO postgres;

--
-- Name: action_plugin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_plugin_id_seq OWNED BY public.action_plugin.id;


--
-- Name: action_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_queue (
    id integer NOT NULL,
    trigger_event integer,
    trigger_payload jsonb,
    template_id integer,
    sequence integer,
    action_code character varying,
    condition_expression jsonb,
    parameter_queries jsonb,
    parameters_evaluated jsonb,
    status public.action_queue_status,
    output jsonb,
    time_queued timestamp with time zone,
    time_completed timestamp with time zone,
    error_log character varying
);


ALTER TABLE public.action_queue OWNER TO postgres;

--
-- Name: action_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.action_queue_id_seq OWNER TO postgres;

--
-- Name: action_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_queue_id_seq OWNED BY public.action_queue.id;


--
-- Name: activity_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_log (
    id integer NOT NULL,
    type public.event_type NOT NULL,
    value character varying NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    application_id integer,
    "table" character varying NOT NULL,
    record_id integer,
    details jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.activity_log OWNER TO postgres;

--
-- Name: activity_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activity_log_id_seq OWNER TO postgres;

--
-- Name: activity_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_log_id_seq OWNED BY public.activity_log.id;


--
-- Name: application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.application_id_seq OWNER TO postgres;

--
-- Name: application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_id_seq OWNED BY public.application.id;


--
-- Name: application_note; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_note (
    id integer NOT NULL,
    application_id integer NOT NULL,
    user_id integer NOT NULL,
    org_id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    comment character varying NOT NULL
);


ALTER TABLE public.application_note OWNER TO postgres;

--
-- Name: application_note_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_note_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.application_note_id_seq OWNER TO postgres;

--
-- Name: application_note_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_note_id_seq OWNED BY public.application_note.id;


--
-- Name: application_response; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_response (
    id integer NOT NULL,
    template_element_id integer NOT NULL,
    application_id integer NOT NULL,
    stage_number integer,
    status public.application_response_status DEFAULT 'DRAFT'::public.application_response_status,
    value jsonb,
    is_valid boolean,
    time_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamp with time zone,
    evaluated_parameters jsonb
);


ALTER TABLE public.application_response OWNER TO postgres;

--
-- Name: application_response_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.application_response_id_seq OWNER TO postgres;

--
-- Name: application_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_response_id_seq OWNED BY public.application_response.id;


--
-- Name: application_stage_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_stage_history (
    id integer NOT NULL,
    application_id integer NOT NULL,
    stage_id integer NOT NULL,
    time_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_current boolean DEFAULT true
);


ALTER TABLE public.application_stage_history OWNER TO postgres;

--
-- Name: application_stage_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_stage_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.application_stage_history_id_seq OWNER TO postgres;

--
-- Name: application_stage_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_stage_history_id_seq OWNED BY public.application_stage_history.id;


--
-- Name: application_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_status_history (
    id integer NOT NULL,
    application_stage_history_id integer NOT NULL,
    status public.application_status,
    time_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_current boolean DEFAULT true,
    application_id integer GENERATED ALWAYS AS (public.application_status_history_application_id(application_stage_history_id)) STORED
);


ALTER TABLE public.application_status_history OWNER TO postgres;

--
-- Name: template; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template (
    id integer NOT NULL,
    name character varying,
    name_plural character varying,
    code character varying NOT NULL,
    is_linear boolean DEFAULT true,
    can_applicant_make_changes boolean DEFAULT true,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '"Thank you! Your application has been submitted."'::jsonb,
    icon character varying,
    template_category_id integer,
    version_timestamp timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 1
);


ALTER TABLE public.template OWNER TO postgres;

--
-- Name: template_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_stage (
    id integer NOT NULL,
    number integer,
    title character varying,
    description character varying,
    colour character varying DEFAULT '#24B5DF'::character varying,
    template_id integer NOT NULL
);


ALTER TABLE public.template_stage OWNER TO postgres;

--
-- Name: application_stage_status_all; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.application_stage_status_all AS
 SELECT application.id AS application_id,
    template.id AS template_id,
    template.name AS template_name,
    template.code AS template_code,
    application.serial,
    application.name,
    application.session_id,
    application.user_id,
    application.org_id,
    stage.stage_id,
    ts.number AS stage_number,
    ts.title AS stage,
    ts.colour AS stage_colour,
    stage.id AS stage_history_id,
    stage.time_created AS stage_history_time_created,
    stage.is_current AS stage_is_current,
    status.id AS status_history_id,
    status.status,
    status.time_created AS status_history_time_created,
    status.is_current AS status_is_current,
    application.outcome
   FROM ((((public.application
     JOIN public.template ON ((application.template_id = template.id)))
     LEFT JOIN public.application_stage_history stage ON ((application.id = stage.application_id)))
     LEFT JOIN public.application_status_history status ON ((stage.id = status.application_stage_history_id)))
     LEFT JOIN public.template_stage ts ON ((stage.stage_id = ts.id)));


ALTER TABLE public.application_stage_status_all OWNER TO postgres;

--
-- Name: application_stage_status_latest; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.application_stage_status_latest AS
 SELECT application_stage_status_all.application_id,
    application_stage_status_all.template_id,
    application_stage_status_all.template_name,
    application_stage_status_all.template_code,
    application_stage_status_all.serial,
    application_stage_status_all.name,
    application_stage_status_all.session_id,
    application_stage_status_all.user_id,
    application_stage_status_all.org_id,
    application_stage_status_all.stage_id,
    application_stage_status_all.stage_number,
    application_stage_status_all.stage,
    application_stage_status_all.stage_colour,
    application_stage_status_all.stage_history_id,
    application_stage_status_all.stage_history_time_created,
    application_stage_status_all.stage_is_current,
    application_stage_status_all.status_history_id,
    application_stage_status_all.status,
    application_stage_status_all.status_history_time_created,
    application_stage_status_all.status_is_current,
    application_stage_status_all.outcome
   FROM public.application_stage_status_all
  WHERE (((application_stage_status_all.stage_is_current = true) OR (application_stage_status_all.stage_is_current IS NULL)) AND ((application_stage_status_all.status_is_current = true) OR (application_stage_status_all.stage_is_current IS NULL)));


ALTER TABLE public.application_stage_status_latest OWNER TO postgres;

--
-- Name: application_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.application_status_history_id_seq OWNER TO postgres;

--
-- Name: application_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_status_history_id_seq OWNED BY public.application_status_history.id;


--
-- Name: constraints_info; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.constraints_info AS
 SELECT constraints_info.constraint_type,
    constraints_info.table_name AS from_table_name,
    from_column_info.column_name AS from_column_name,
    to_column_info.table_name AS to_table_name,
    to_column_info.column_name AS to_column_name
   FROM ((information_schema.table_constraints constraints_info
     JOIN information_schema.key_column_usage from_column_info ON (((constraints_info.constraint_name)::name = (from_column_info.constraint_name)::name)))
     JOIN information_schema.constraint_column_usage to_column_info ON (((constraints_info.constraint_name)::name = (to_column_info.constraint_name)::name)));


ALTER TABLE public.constraints_info OWNER TO postgres;

--
-- Name: counter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.counter (
    id integer NOT NULL,
    name character varying NOT NULL,
    value integer DEFAULT 0
);


ALTER TABLE public.counter OWNER TO postgres;

--
-- Name: counter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.counter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.counter_id_seq OWNER TO postgres;

--
-- Name: counter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.counter_id_seq OWNED BY public.counter.id;


--
-- Name: data_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_table (
    id integer NOT NULL,
    table_name character varying NOT NULL,
    display_name character varying,
    field_map jsonb,
    is_lookup_table boolean DEFAULT false,
    data_view_code character varying
);


ALTER TABLE public.data_table OWNER TO postgres;

--
-- Name: data_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.data_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_table_id_seq OWNER TO postgres;

--
-- Name: data_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.data_table_id_seq OWNED BY public.data_table.id;


--
-- Name: data_view; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_view (
    id integer NOT NULL,
    table_name character varying NOT NULL,
    title character varying,
    code character varying NOT NULL,
    permission_names character varying[],
    row_restrictions jsonb DEFAULT '{}'::jsonb,
    table_view_include_columns character varying[],
    table_view_exclude_columns character varying[],
    detail_view_include_columns character varying[],
    detail_view_exclude_columns character varying[],
    detail_view_header_column character varying NOT NULL,
    show_linked_applications boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 1,
    table_search_columns character varying[],
    filter_include_columns character varying[],
    filter_exclude_columns character varying[],
    default_sort_column character varying
);


ALTER TABLE public.data_view OWNER TO postgres;

--
-- Name: data_view_column_definition; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.data_view_column_definition (
    id integer NOT NULL,
    table_name character varying,
    column_name character varying,
    title character varying,
    element_type_plugin_code character varying,
    element_parameters jsonb,
    additional_formatting jsonb,
    value_expression jsonb,
    sort_column character varying,
    filter_parameters jsonb,
    filter_expression jsonb,
    filter_data_type character varying
);


ALTER TABLE public.data_view_column_definition OWNER TO postgres;

--
-- Name: data_view_column_definition_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.data_view_column_definition_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_view_column_definition_id_seq OWNER TO postgres;

--
-- Name: data_view_column_definition_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.data_view_column_definition_id_seq OWNED BY public.data_view_column_definition.id;


--
-- Name: data_view_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.data_view_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.data_view_id_seq OWNER TO postgres;

--
-- Name: data_view_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.data_view_id_seq OWNED BY public.data_view.id;


--
-- Name: element_type_plugin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.element_type_plugin (
    code character varying NOT NULL,
    name character varying,
    description character varying,
    category public.template_element_category,
    path character varying,
    display_component_name character varying,
    config_component_name character varying,
    required_parameters character varying[]
);


ALTER TABLE public.element_type_plugin OWNER TO postgres;

--
-- Name: file; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file (
    id integer NOT NULL,
    unique_id character varying NOT NULL,
    original_filename character varying NOT NULL,
    user_id integer,
    template_id integer,
    application_serial character varying,
    application_response_id integer,
    description character varying,
    application_note_id integer,
    is_output_doc boolean DEFAULT false NOT NULL,
    is_internal_reference_doc boolean DEFAULT false NOT NULL,
    is_external_reference_doc boolean DEFAULT false NOT NULL,
    to_be_deleted boolean DEFAULT false NOT NULL,
    file_path character varying NOT NULL,
    thumbnail_path character varying,
    mimetype character varying,
    submitted boolean DEFAULT false,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.file OWNER TO postgres;

--
-- Name: file_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.file_id_seq OWNER TO postgres;

--
-- Name: file_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_id_seq OWNED BY public.file.id;


--
-- Name: filter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.filter (
    id integer NOT NULL,
    code character varying NOT NULL,
    title character varying,
    query jsonb,
    user_role public.permission_policy_type
);


ALTER TABLE public.filter OWNER TO postgres;

--
-- Name: filter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.filter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.filter_id_seq OWNER TO postgres;

--
-- Name: filter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.filter_id_seq OWNED BY public.filter.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    user_id integer,
    application_id integer,
    review_id integer,
    email_recipients character varying,
    subject character varying,
    message character varying,
    attachments character varying[],
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_read boolean DEFAULT false,
    email_sent boolean DEFAULT false,
    email_server_log character varying
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_id_seq OWNER TO postgres;

--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: organisation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organisation (
    id integer NOT NULL,
    name character varying,
    registration character varying,
    address character varying,
    logo_url character varying,
    is_system_org boolean DEFAULT false
);


ALTER TABLE public.organisation OWNER TO postgres;

--
-- Name: organisation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.organisation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organisation_id_seq OWNER TO postgres;

--
-- Name: organisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.organisation_id_seq OWNED BY public.organisation.id;


--
-- Name: permission_join; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_join (
    id integer NOT NULL,
    user_id integer,
    organisation_id integer,
    permission_name_id integer NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.permission_join OWNER TO postgres;

--
-- Name: permission_join_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_join_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permission_join_id_seq OWNER TO postgres;

--
-- Name: permission_join_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_join_id_seq OWNED BY public.permission_join.id;


--
-- Name: permission_name; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_name (
    id integer NOT NULL,
    name character varying,
    description character varying,
    permission_policy_id integer,
    is_system_org_permission boolean DEFAULT false
);


ALTER TABLE public.permission_name OWNER TO postgres;

--
-- Name: permission_name_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_name_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permission_name_id_seq OWNER TO postgres;

--
-- Name: permission_name_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_name_id_seq OWNED BY public.permission_name.id;


--
-- Name: permission_policy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission_policy (
    id integer NOT NULL,
    name character varying,
    description character varying,
    rules jsonb,
    type public.permission_policy_type,
    is_admin boolean DEFAULT false,
    default_restrictions jsonb
);


ALTER TABLE public.permission_policy OWNER TO postgres;

--
-- Name: permission_policy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_policy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permission_policy_id_seq OWNER TO postgres;

--
-- Name: permission_policy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_policy_id_seq OWNED BY public.permission_policy.id;


--
-- Name: template_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_category (
    id integer NOT NULL,
    code character varying NOT NULL,
    title character varying,
    icon character varying,
    ui_location public.ui_location[] DEFAULT '{DASHBOARD,LIST}'::public.ui_location[]
);


ALTER TABLE public.template_category OWNER TO postgres;

--
-- Name: template_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_permission (
    id integer NOT NULL,
    permission_name_id integer,
    template_id integer NOT NULL,
    allowed_sections character varying[],
    can_self_assign boolean DEFAULT false NOT NULL,
    can_make_final_decision boolean DEFAULT false NOT NULL,
    stage_number integer,
    level_number integer,
    restrictions jsonb
);


ALTER TABLE public.template_permission OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    first_name character varying,
    last_name character varying,
    full_name character varying GENERATED ALWAYS AS ((((first_name)::text || ' '::text) || (last_name)::text)) STORED,
    username public.citext,
    email character varying,
    date_of_birth date,
    password_hash character varying
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: permissions_all; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.permissions_all AS
 SELECT "user".username,
    organisation.name AS "orgName",
    template.code AS "templateCode",
    permission_name.name AS "permissionName",
    permission_name.description,
    template_permission.stage_number AS "stageNumber",
    template_permission.level_number AS "reviewLevel",
    template_permission.allowed_sections AS "allowedSections",
    template_permission.can_self_assign AS "canSelfAssign",
    template_permission.can_make_final_decision AS "canMakeFinalDecision",
    template_permission.restrictions,
    permission_policy.name AS "policyName",
    permission_policy.type AS "permissionType",
    permission_policy.is_admin AS "isAdmin",
    permission_policy.id AS "permissionPolicyId",
    permission_policy.rules AS "permissionPolicyRules",
    permission_name.id AS "permissionNameId",
    template_permission.id AS "templatePermissionId",
    template.id AS "templateId",
    "user".id AS "userId",
    permission_join.id AS "permissionJoinId",
    permission_join.organisation_id AS "orgId",
        CASE
            WHEN (template_category.ui_location @> ARRAY['USER'::public.ui_location]) THEN true
            ELSE false
        END AS "isUserCategory",
    permission_name.is_system_org_permission AS "isSystemOrgPermission",
    permission_join.is_active AS "isActive"
   FROM (((((((public.permission_name
     LEFT JOIN public.permission_join ON ((permission_join.permission_name_id = permission_name.id)))
     JOIN public.permission_policy ON ((permission_policy.id = permission_name.permission_policy_id)))
     LEFT JOIN public."user" ON ((permission_join.user_id = "user".id)))
     LEFT JOIN public.organisation ON ((permission_join.organisation_id = organisation.id)))
     LEFT JOIN public.template_permission ON ((template_permission.permission_name_id = permission_name.id)))
     LEFT JOIN public.template ON ((template.id = template_permission.template_id)))
     LEFT JOIN public.template_category ON ((template.template_category_id = template_category.id)));


ALTER TABLE public.permissions_all OWNER TO postgres;

--
-- Name: postgres_row_level; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.postgres_row_level AS
 SELECT pg_policies.schemaname,
    pg_policies.tablename,
    pg_policies.policyname,
    pg_policies.permissive,
    pg_policies.roles,
    pg_policies.cmd,
    pg_policies.qual,
    pg_policies.with_check
   FROM pg_policies;


ALTER TABLE public.postgres_row_level OWNER TO postgres;

--
-- Name: review_assignment_assigner_join; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_assignment_assigner_join (
    id integer NOT NULL,
    assigner_id integer,
    organisation_id integer,
    review_assignment_id integer NOT NULL
);


ALTER TABLE public.review_assignment_assigner_join OWNER TO postgres;

--
-- Name: review_assignment_assigner_join_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_assignment_assigner_join_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_assignment_assigner_join_id_seq OWNER TO postgres;

--
-- Name: review_assignment_assigner_join_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_assignment_assigner_join_id_seq OWNED BY public.review_assignment_assigner_join.id;


--
-- Name: review_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_assignment_id_seq OWNER TO postgres;

--
-- Name: review_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_assignment_id_seq OWNED BY public.review_assignment.id;


--
-- Name: review_decision_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_decision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_decision_id_seq OWNER TO postgres;

--
-- Name: review_decision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_decision_id_seq OWNED BY public.review_decision.id;


--
-- Name: review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_id_seq OWNER TO postgres;

--
-- Name: review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_id_seq OWNED BY public.review.id;


--
-- Name: review_response; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_response (
    id integer NOT NULL,
    comment character varying,
    decision public.review_response_decision,
    application_response_id integer,
    review_response_link_id integer,
    original_review_response_id integer,
    review_id integer,
    time_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamp with time zone,
    is_visible_to_applicant boolean DEFAULT false,
    is_latest_review boolean DEFAULT false,
    template_element_id integer,
    recommended_applicant_visibility public.review_response_recommended_applicant_visibility DEFAULT 'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT'::public.review_response_recommended_applicant_visibility,
    status public.review_response_status DEFAULT 'DRAFT'::public.review_response_status,
    stage_number integer GENERATED ALWAYS AS (public.review_response_stage_number(review_id)) STORED
);


ALTER TABLE public.review_response OWNER TO postgres;

--
-- Name: review_response_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_response_id_seq OWNER TO postgres;

--
-- Name: review_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_response_id_seq OWNED BY public.review_response.id;


--
-- Name: review_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.review_status_history (
    id integer NOT NULL,
    review_id integer NOT NULL,
    status public.review_status,
    time_created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_current boolean DEFAULT true
);


ALTER TABLE public.review_status_history OWNER TO postgres;

--
-- Name: review_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.review_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.review_status_history_id_seq OWNER TO postgres;

--
-- Name: review_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.review_status_history_id_seq OWNED BY public.review_status_history.id;


--
-- Name: schema_columns; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.schema_columns AS
 SELECT tables_info.table_name,
    tables_info.table_type,
    columns_info.column_name,
    columns_info.is_nullable,
    columns_info.is_generated,
    columns_info.data_type,
    element_types.data_type AS sub_data_type,
    constraints_info.constraint_type,
    constraints_info.to_table_name AS fk_to_table_name,
    constraints_info.to_column_name AS fk_to_column_name
   FROM (((information_schema.tables tables_info
     JOIN information_schema.columns columns_info ON (((tables_info.table_name)::name = (columns_info.table_name)::name)))
     LEFT JOIN information_schema.element_types element_types ON ((((columns_info.dtd_identifier)::name = (element_types.collection_type_identifier)::name) AND ((columns_info.table_name)::name = (element_types.object_name)::name))))
     LEFT JOIN public.constraints_info ON ((((columns_info.table_name)::name = (constraints_info.from_table_name)::name) AND ((columns_info.column_name)::name = (constraints_info.from_column_name)::name))))
  WHERE (((tables_info.table_schema)::name <> 'pg_catalog'::name) AND ((tables_info.table_schema)::name <> 'information_schema'::name))
  ORDER BY columns_info.table_name, columns_info.column_name;


ALTER TABLE public.schema_columns OWNER TO postgres;

--
-- Name: system_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_info (
    id integer NOT NULL,
    name character varying NOT NULL,
    value jsonb DEFAULT '{}'::jsonb,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_info OWNER TO postgres;

--
-- Name: system_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.system_info_id_seq OWNER TO postgres;

--
-- Name: system_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_info_id_seq OWNED BY public.system_info.id;


--
-- Name: template_action_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_action_id_seq OWNER TO postgres;

--
-- Name: template_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_action_id_seq OWNED BY public.template_action.id;


--
-- Name: template_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_category_id_seq OWNER TO postgres;

--
-- Name: template_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_category_id_seq OWNED BY public.template_category.id;


--
-- Name: template_element_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_element_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_element_id_seq OWNER TO postgres;

--
-- Name: template_element_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_element_id_seq OWNED BY public.template_element.id;


--
-- Name: template_filter_join; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_filter_join (
    id integer NOT NULL,
    template_id integer NOT NULL,
    filter_id integer NOT NULL
);


ALTER TABLE public.template_filter_join OWNER TO postgres;

--
-- Name: template_filter_join_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_filter_join_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_filter_join_id_seq OWNER TO postgres;

--
-- Name: template_filter_join_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_filter_join_id_seq OWNED BY public.template_filter_join.id;


--
-- Name: template_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_id_seq OWNER TO postgres;

--
-- Name: template_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_id_seq OWNED BY public.template.id;


--
-- Name: template_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_permission_id_seq OWNER TO postgres;

--
-- Name: template_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_permission_id_seq OWNED BY public.template_permission.id;


--
-- Name: template_section; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_section (
    id integer NOT NULL,
    template_id integer NOT NULL,
    title character varying,
    code character varying,
    index integer
);


ALTER TABLE public.template_section OWNER TO postgres;

--
-- Name: template_section_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_section_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_section_id_seq OWNER TO postgres;

--
-- Name: template_section_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_section_id_seq OWNED BY public.template_section.id;


--
-- Name: template_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_stage_id_seq OWNER TO postgres;

--
-- Name: template_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_stage_id_seq OWNED BY public.template_stage.id;


--
-- Name: template_stage_review_level; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.template_stage_review_level (
    id integer NOT NULL,
    stage_id integer NOT NULL,
    number integer NOT NULL,
    name character varying NOT NULL,
    description character varying
);


ALTER TABLE public.template_stage_review_level OWNER TO postgres;

--
-- Name: template_stage_review_level_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.template_stage_review_level_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.template_stage_review_level_id_seq OWNER TO postgres;

--
-- Name: template_stage_review_level_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.template_stage_review_level_id_seq OWNED BY public.template_stage_review_level.id;


--
-- Name: trigger_queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trigger_queue (
    id integer NOT NULL,
    trigger_type public.trigger,
    "table" character varying,
    record_id integer,
    event_code character varying,
    data jsonb,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status public.trigger_queue_status,
    log jsonb
);


ALTER TABLE public.trigger_queue OWNER TO postgres;

--
-- Name: trigger_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trigger_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trigger_queue_id_seq OWNER TO postgres;

--
-- Name: trigger_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trigger_queue_id_seq OWNED BY public.trigger_queue.id;


--
-- Name: trigger_schedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trigger_schedule (
    id integer NOT NULL,
    event_code character varying,
    time_scheduled timestamp with time zone NOT NULL,
    application_id integer NOT NULL,
    template_id integer,
    data jsonb,
    is_active boolean DEFAULT true,
    editor_user_id integer,
    trigger public.trigger
);


ALTER TABLE public.trigger_schedule OWNER TO postgres;

--
-- Name: trigger_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trigger_schedule_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trigger_schedule_id_seq OWNER TO postgres;

--
-- Name: trigger_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trigger_schedule_id_seq OWNED BY public.trigger_schedule.id;


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: user_organisation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_organisation (
    id integer NOT NULL,
    user_id integer NOT NULL,
    organisation_id integer NOT NULL,
    user_role character varying
);


ALTER TABLE public.user_organisation OWNER TO postgres;

--
-- Name: user_org_join; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_org_join AS
 SELECT "user".id AS user_id,
    "user".username,
    "user".first_name,
    "user".last_name,
    "user".email,
    "user".date_of_birth,
    "user".password_hash,
    user_organisation.organisation_id AS org_id,
    organisation.name AS org_name,
    user_organisation.user_role,
    organisation.registration,
    organisation.address,
    organisation.logo_url,
    organisation.is_system_org
   FROM ((public."user"
     LEFT JOIN public.user_organisation ON (("user".id = user_organisation.user_id)))
     LEFT JOIN public.organisation ON ((organisation.id = user_organisation.organisation_id)));


ALTER TABLE public.user_org_join OWNER TO postgres;

--
-- Name: user_organisation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_organisation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_organisation_id_seq OWNER TO postgres;

--
-- Name: user_organisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_organisation_id_seq OWNED BY public.user_organisation.id;


--
-- Name: verification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification (
    id integer NOT NULL,
    unique_id character varying NOT NULL,
    application_id integer NOT NULL,
    event_code character varying,
    message character varying,
    data jsonb,
    time_created timestamp with time zone DEFAULT now(),
    time_expired timestamp with time zone,
    is_verified boolean DEFAULT false,
    trigger public.trigger
);


ALTER TABLE public.verification OWNER TO postgres;

--
-- Name: verification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.verification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.verification_id_seq OWNER TO postgres;

--
-- Name: verification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.verification_id_seq OWNED BY public.verification.id;


--
-- Name: action_plugin id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_plugin ALTER COLUMN id SET DEFAULT nextval('public.action_plugin_id_seq'::regclass);


--
-- Name: action_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_queue ALTER COLUMN id SET DEFAULT nextval('public.action_queue_id_seq'::regclass);


--
-- Name: activity_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log ALTER COLUMN id SET DEFAULT nextval('public.activity_log_id_seq'::regclass);


--
-- Name: application id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application ALTER COLUMN id SET DEFAULT nextval('public.application_id_seq'::regclass);


--
-- Name: application_note id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_note ALTER COLUMN id SET DEFAULT nextval('public.application_note_id_seq'::regclass);


--
-- Name: application_response id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_response ALTER COLUMN id SET DEFAULT nextval('public.application_response_id_seq'::regclass);


--
-- Name: application_stage_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_stage_history ALTER COLUMN id SET DEFAULT nextval('public.application_stage_history_id_seq'::regclass);


--
-- Name: application_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history ALTER COLUMN id SET DEFAULT nextval('public.application_status_history_id_seq'::regclass);


--
-- Name: counter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter ALTER COLUMN id SET DEFAULT nextval('public.counter_id_seq'::regclass);


--
-- Name: data_table id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table ALTER COLUMN id SET DEFAULT nextval('public.data_table_id_seq'::regclass);


--
-- Name: data_view id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_view ALTER COLUMN id SET DEFAULT nextval('public.data_view_id_seq'::regclass);


--
-- Name: data_view_column_definition id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_view_column_definition ALTER COLUMN id SET DEFAULT nextval('public.data_view_column_definition_id_seq'::regclass);


--
-- Name: file id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file ALTER COLUMN id SET DEFAULT nextval('public.file_id_seq'::regclass);


--
-- Name: filter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter ALTER COLUMN id SET DEFAULT nextval('public.filter_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: organisation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation ALTER COLUMN id SET DEFAULT nextval('public.organisation_id_seq'::regclass);


--
-- Name: permission_join id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_join ALTER COLUMN id SET DEFAULT nextval('public.permission_join_id_seq'::regclass);


--
-- Name: permission_name id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_name ALTER COLUMN id SET DEFAULT nextval('public.permission_name_id_seq'::regclass);


--
-- Name: permission_policy id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_policy ALTER COLUMN id SET DEFAULT nextval('public.permission_policy_id_seq'::regclass);


--
-- Name: review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review ALTER COLUMN id SET DEFAULT nextval('public.review_id_seq'::regclass);


--
-- Name: review_assignment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment ALTER COLUMN id SET DEFAULT nextval('public.review_assignment_id_seq'::regclass);


--
-- Name: review_assignment_assigner_join id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment_assigner_join ALTER COLUMN id SET DEFAULT nextval('public.review_assignment_assigner_join_id_seq'::regclass);


--
-- Name: review_decision id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision ALTER COLUMN id SET DEFAULT nextval('public.review_decision_id_seq'::regclass);


--
-- Name: review_response id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response ALTER COLUMN id SET DEFAULT nextval('public.review_response_id_seq'::regclass);


--
-- Name: review_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_status_history ALTER COLUMN id SET DEFAULT nextval('public.review_status_history_id_seq'::regclass);


--
-- Name: system_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_info ALTER COLUMN id SET DEFAULT nextval('public.system_info_id_seq'::regclass);


--
-- Name: template id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template ALTER COLUMN id SET DEFAULT nextval('public.template_id_seq'::regclass);


--
-- Name: template_action id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_action ALTER COLUMN id SET DEFAULT nextval('public.template_action_id_seq'::regclass);


--
-- Name: template_category id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_category ALTER COLUMN id SET DEFAULT nextval('public.template_category_id_seq'::regclass);


--
-- Name: template_element id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_element ALTER COLUMN id SET DEFAULT nextval('public.template_element_id_seq'::regclass);


--
-- Name: template_filter_join id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_filter_join ALTER COLUMN id SET DEFAULT nextval('public.template_filter_join_id_seq'::regclass);


--
-- Name: template_permission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_permission ALTER COLUMN id SET DEFAULT nextval('public.template_permission_id_seq'::regclass);


--
-- Name: template_section id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_section ALTER COLUMN id SET DEFAULT nextval('public.template_section_id_seq'::regclass);


--
-- Name: template_stage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_stage ALTER COLUMN id SET DEFAULT nextval('public.template_stage_id_seq'::regclass);


--
-- Name: template_stage_review_level id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_stage_review_level ALTER COLUMN id SET DEFAULT nextval('public.template_stage_review_level_id_seq'::regclass);


--
-- Name: trigger_queue id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_queue ALTER COLUMN id SET DEFAULT nextval('public.trigger_queue_id_seq'::regclass);


--
-- Name: trigger_schedule id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_schedule ALTER COLUMN id SET DEFAULT nextval('public.trigger_schedule_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_organisation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organisation ALTER COLUMN id SET DEFAULT nextval('public.user_organisation_id_seq'::regclass);


--
-- Name: verification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification ALTER COLUMN id SET DEFAULT nextval('public.verification_id_seq'::regclass);


--
-- Data for Name: action_plugin; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.action_plugin VALUES (1, 'changeOutcome', 'Change Outcome', 'Changes the outcome field of an application.', '../plugins/action_change_outcome/src/index.ts', '{newOutcome}', '{applicationId}', '{applicationId,newOutcome}');
INSERT INTO public.action_plugin VALUES (2, 'changeStatus', 'Change Status', 'Changes the Status of an application', '../plugins/action_change_status/src/index.ts', '{newStatus}', '{applicationId,reviewId,isReview}', '{applicationId,status,statusId,applicationStatusHistoryTimestamp,reviewStatusHistoryTimestamp}');
INSERT INTO public.action_plugin VALUES (3, 'cLog', 'Console Logger', 'All it does is print a message to the console. That''s it.', '../plugins/action_console_log/src/index.ts', '{message}', '{}', '{}');
INSERT INTO public.action_plugin VALUES (4, 'createVerification', 'Create Verification', 'Adds a record to verification table', '../plugins/action_create_verification/src/index.ts', '{applicationId}', '{uniqueId,expiry,message,code,data}', '{verification}');
INSERT INTO public.action_plugin VALUES (5, 'cleanupFiles', 'Clean up application files', 'Checks all the uploaded files associated with an application, and deletes any that are not part of an application_response', '../plugins/action_files_cleanup/src/index.ts', '{applicationSerial}', NULL, '{deletedFiles}');
INSERT INTO public.action_plugin VALUES (6, 'generateDoc', 'Generate Document', 'Generates a PDF document from a Carbone template', '../plugins/action_generate_document/src/index.ts', '{docTemplateId}', '{options,additionalData,userId,applicationSerial,templateId}', '{document}');
INSERT INTO public.action_plugin VALUES (7, 'generateReviewAssignments', 'Generate Review Assignment Records', 'Generates review_assignment records for current application', '../plugins/action_generate_review_assignment_records/src/index.ts', '{}', '{applicationId,reviewId}', '{levels}');
INSERT INTO public.action_plugin VALUES (8, 'generateTextString', 'Generate Text String', 'Generates serial numbers or arbitrary text strings (e.g. for application name) using a specified pattern, and updates a database record if requested', '../plugins/action_generate_text_string/src/index.ts', '{pattern}', '{counterName,customFields,additionalData,counterInit,numberFormat,fallbackText,updateRecord,tableName,fieldName,matchField,matchValue}', '{generatedText}');
INSERT INTO public.action_plugin VALUES (9, 'grantPermissions', 'Grant Permissions', 'Grants permission to user/org, creates permission join from user/org to permission name. If org not provided, the permission will be granted to the user only.', '../plugins/action_grant_permissions/src/index.ts', '{permissionNames}', '{username,userId,orgName,orgId}', '{permissionJoinIds,permissionNames}');
INSERT INTO public.action_plugin VALUES (10, 'incrementStage', 'Increment Stage', 'Increments (or creates) the application Stage, if possible.', '../plugins/action_increment_stage/src/index.ts', '{}', '{applicationId}', '{applicationId,stageNumber,stageName,stageId,status,statusId}');
INSERT INTO public.action_plugin VALUES (11, 'joinUserOrg', 'Add User to Organisation', 'Links a user to an organisation', '../plugins/action_join_user_org/src/index.ts', '{user_id,org_id}', '{user_role}', '{userOrgId}');
INSERT INTO public.action_plugin VALUES (12, 'modifyRecord', 'Modify Record', 'Inserts or updates a record in database, e.g. User, Org', '../plugins/action_modify_record/src/index.ts', '{tableName}', '{matchField,matchValue,shouldCreateJoinTable,"<other record fields>"}', '{<tableName>}');
INSERT INTO public.action_plugin VALUES (13, 'sendNotification', 'Send Email', 'Creates a notification and send an email', '../plugins/action_send_notification/src/index.ts', '{subject,message}', '{userId,fromName,fromEmail,attachments,sendEmail}', '{notification}');
INSERT INTO public.action_plugin VALUES (14, 'trimResponses', 'Trim duplicate reponses', 'Trims duplicated application or review responses if nothing has changed', '../plugins/action_trim_responses/src/index.ts', '{}', '{applicationId,reviewId}', '{deletedIds,updatedIds}');
INSERT INTO public.action_plugin VALUES (17, 'updateReviewVisibility', 'Update Applicant''s Review Visibility', 'Updates review response records to be visible to Applicant based on recommendations of last level review', '../plugins/action_update_review_visibility/src/index.ts', '{}', '{reviewId}', '{reviewResponsesWithUpdatedVisibility}');
INSERT INTO public.action_plugin VALUES (18, 'revokePermissions', 'Revoke Permissions', 'Revokes existing permission(s) from user/org -- only sets existing permissions to inactive, doesn''t actually delete records', '../plugins/action_revoke_permissions/src/index.ts', '{permissionNames}', '{username,orgName,orgId,isRemovingPermission}', '{revokedPermissions}');
INSERT INTO public.action_plugin VALUES (19, 'scheduleAction', 'Create Scheduled Action', 'Adds a record to action_schedule table to schedule an action for some time in the future', '../plugins/action_schedule_action/src/index.ts', '{duration}', '{eventCode,applicationId,templateId,cancel,data}', '{scheduledEvent}');
INSERT INTO public.action_plugin VALUES (20, 'refreshReviewAssignments', 'Refresh User Review Assignment Records', 'Re-generates ALL review assignments for all applications associated with specific user', '../plugins/action_refresh_review_assignments/src/index.ts', '{}', '{userId}', '{updatedApplications}');
INSERT INTO public.action_plugin VALUES (21, 'alias', 'Alias Action', 'Dummy plugin to facilitate aliasing of template actions', '../plugins/action_alias/src/index.ts', '{code}', '{shouldOverrideCondition,...anyPluginFields}', '{}');
INSERT INTO public.action_plugin VALUES (22, 'modifyMultipleRecords', 'Modify Multiple Records', 'Inserts or updates multiple database records', '../plugins/action_modify_multiple_records/src/index.ts', '{records}', '{tableName,matchField,matchValue,shouldCreateJoinTable,"<other record fields>"}', '{records}');
INSERT INTO public.action_plugin VALUES (23, 'removeUserOrg', 'Remove User from Organisation', 'Removes a user from an organistion', '../plugins/action_remove_user_org/src/index.ts', '{user_id,org_id}', '{}', '{userOrgId}');


--
-- Data for Name: action_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: activity_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.activity_log VALUES (2, 'PERMISSION', 'Granted', '2022-08-15 14:35:11.459864+12', NULL, 'permission_join', 14, '{"user": {"id": 3, "name": "System Manager", "username": "manager"}, "isActive": true, "permission": {"id": 15, "name": "systemManager"}, "organisation": {"id": 1, "name": "Food and Drug Authority"}}');
INSERT INTO public.activity_log VALUES (3, 'PERMISSION', 'Granted', '2022-08-15 14:35:38.863497+12', NULL, 'permission_join', 15, '{"user": {"id": 2, "name": "Admin Admin", "username": "admin"}, "isActive": true, "permission": {"id": 15, "name": "systemManager"}, "organisation": {"id": 1, "name": "Food and Drug Authority"}}');


--
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.application VALUES (1, 1, 2, NULL, '81YuHj9EFcvKanvB', 'UE-CJD-0100', 'Edit User Details - UE-CJD-0100', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (10, 10, 2, NULL, 'WXsvhggdwhlsHadx', 'S-EMF-0001', 'Core-actions Templates - S-EMF-0001', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (11, 9, 2, NULL, 'WXsvhggdwhlsHadx', 'S-XHH-0002', 'Demo -- Feature Showcase - S-XHH-0002', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (12, 8, 2, NULL, 'WXsvhggdwhlsHadx', 'S-RDR-0002', 'Join Company - S-RDR-0002', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (13, 7, 2, NULL, 'WXsvhggdwhlsHadx', 'S-TNQ-0006', 'Company Registration - S-TNQ-0006', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (14, 2, 2, NULL, 'c2RCyfSn9SKAMkHV', 'UR-MJO-0100', 'User Registration - UR-MJO-0100', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (15, 11, 2, NULL, 'MzIFSjFjwPB62Fm4', 'FGNcKlqknNdtQOx8hjWeKbSH', 'Reset Password - 0100', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (16, 12, 2, NULL, 'TkxXnE-usV5cYb2a', 'P-TFT-0001', 'Grant User Permissions - P-TFT-0001', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (17, 13, 2, NULL, 'TkxXnE-usV5cYb2a', 'P-NLI-0001', 'Add User to Company - P-NLI-0001', 'PENDING', true, true, NULL);
INSERT INTO public.application VALUES (18, 11, 1, NULL, 'oD3wTEt3AkljPFtP', '3jHSayW8nGJb1yjQlWKCIWis', 'Reset Password - 0106', 'PENDING', true, false, NULL);
INSERT INTO public.application VALUES (19, 11, 1, NULL, 'Eu2RD6_X5XMtTVrM', 'DMvXoQQWe5Uhkb6ukmrhBOID', 'Reset Password - 0107', 'PENDING', true, false, NULL);


--
-- Data for Name: application_list_shape; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: application_note; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: application_response; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.application_response VALUES (1, 1, 1, NULL, 'DRAFT', NULL, NULL, '2021-08-10 14:14:28.157276+12', '2021-08-10 14:14:28.157276+12', NULL, NULL);
INSERT INTO public.application_response VALUES (2, 2, 1, NULL, 'DRAFT', '{"text": "Admin"}', NULL, '2021-08-10 14:14:28.157276+12', '2021-08-10 14:14:28.157276+12', NULL, NULL);
INSERT INTO public.application_response VALUES (3, 3, 1, NULL, 'DRAFT', '{"text": "Admin"}', NULL, '2021-08-10 14:14:28.157276+12', '2021-08-10 14:14:28.157276+12', NULL, NULL);
INSERT INTO public.application_response VALUES (4, 4, 1, 1, 'DRAFT', '{"text": "admin"}', true, '2021-08-10 14:14:28.157276+12', '2021-10-08 11:37:00.858006+13', NULL, NULL);
INSERT INTO public.application_response VALUES (5, 5, 1, 1, 'DRAFT', NULL, NULL, '2021-08-10 14:14:28.157276+12', '2021-10-08 11:36:26.632007+13', NULL, NULL);
INSERT INTO public.application_response VALUES (6, 6, 1, 1, 'DRAFT', '{"text": "Yes", "values": {"0": {"text": "Yes", "selected": true, "textNegative": ""}}, "selectedValuesArray": [{"key": 0, "text": "Yes", "label": "Yes", "selected": true, "textNegative": ""}]}', true, '2021-08-10 14:14:28.157276+12', '2021-10-08 11:30:47.41595+13', NULL, NULL);
INSERT INTO public.application_response VALUES (7, 7, 1, 1, 'DRAFT', '{"hash": "", "text": "•••••••"}', true, '2021-08-10 14:14:28.157276+12', '2021-10-08 11:31:28.68583+13', NULL, NULL);
INSERT INTO public.application_response VALUES (8, 8, 1, NULL, 'DRAFT', NULL, NULL, '2021-08-10 14:14:28.157276+12', '2021-08-10 14:14:28.157276+12', NULL, NULL);
INSERT INTO public.application_response VALUES (126, 160, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (127, 161, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (128, 162, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (129, 163, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (130, 164, 10, 1, 'DRAFT', '{"text": "*Nenhum selecionado*", "values": {"1": {"key": "1", "text": "Yes", "label": "Yes", "selected": false, "textNegative": ""}}, "textUnselected": "Yes", "textMarkdownList": "- *Nenhum selecionado*\n", "selectedValuesArray": [], "unselectedValuesArray": [{"key": "1", "text": "Yes", "label": "Yes", "selected": false, "textNegative": ""}], "textMarkdownPropertyList": "- Yes: \n", "textUnselectedMarkdownList": "- Yes\n"}', true, '2021-09-08 19:33:44.292633+12', '2022-09-19 14:40:05.752533+12', NULL, NULL);
INSERT INTO public.application_response VALUES (131, 165, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (132, 167, 10, 1, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2022-09-19 14:40:13.263232+12', NULL, NULL);
INSERT INTO public.application_response VALUES (133, 168, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (134, 169, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (135, 170, 10, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2021-09-08 19:33:44.292633+12', NULL, NULL);
INSERT INTO public.application_response VALUES (136, 171, 10, 1, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2022-09-19 14:40:15.932352+12', NULL, NULL);
INSERT INTO public.application_response VALUES (137, 172, 10, 1, 'DRAFT', NULL, NULL, '2021-09-08 19:33:44.292633+12', '2022-09-19 14:40:15.937243+12', NULL, NULL);
INSERT INTO public.application_response VALUES (138, 114, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (139, 115, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (140, 116, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (141, 117, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (142, 118, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (143, 120, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (144, 121, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (145, 122, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (146, 123, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (147, 124, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (148, 126, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (149, 127, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (150, 129, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (151, 130, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (152, 131, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (153, 132, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (154, 133, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (155, 134, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (156, 135, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (157, 136, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (158, 138, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (159, 139, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (160, 140, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (161, 141, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (162, 142, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (163, 143, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (164, 144, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (165, 146, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (166, 148, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (167, 149, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (168, 150, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (169, 151, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (170, 152, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (171, 153, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (172, 154, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (173, 156, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (174, 157, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (175, 158, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (176, 159, 11, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:34:26.484794+12', '2021-09-08 19:34:26.484794+12', NULL, NULL);
INSERT INTO public.application_response VALUES (177, 107, 12, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:07.304769+12', '2021-09-08 19:35:07.304769+12', NULL, NULL);
INSERT INTO public.application_response VALUES (178, 108, 12, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:07.304769+12', '2021-09-08 19:35:07.304769+12', NULL, NULL);
INSERT INTO public.application_response VALUES (179, 109, 12, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:07.304769+12', '2021-09-08 19:35:07.304769+12', NULL, NULL);
INSERT INTO public.application_response VALUES (180, 111, 12, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:07.304769+12', '2021-09-08 19:35:07.304769+12', NULL, NULL);
INSERT INTO public.application_response VALUES (181, 112, 12, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:07.304769+12', '2021-09-08 19:35:07.304769+12', NULL, NULL);
INSERT INTO public.application_response VALUES (182, 113, 12, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:07.304769+12', '2021-09-08 19:35:07.304769+12', NULL, NULL);
INSERT INTO public.application_response VALUES (183, 94, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (184, 95, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (185, 96, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (186, 97, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (187, 98, 13, 1, 'DRAFT', '{"text": "*<Nothing Selected>*", "values": {"1": {"text": "Yes", "selected": false, "textNegative": ""}}, "selectedValuesArray": []}', true, '2021-09-08 19:35:33.001937+12', '2021-09-09 12:20:17.219291+12', NULL, NULL);
INSERT INTO public.application_response VALUES (188, 99, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (189, 101, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (190, 102, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (191, 103, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (192, 104, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (193, 105, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (194, 106, 13, NULL, 'DRAFT', NULL, NULL, '2021-09-08 19:35:33.001937+12', '2021-09-08 19:35:33.001937+12', NULL, NULL);
INSERT INTO public.application_response VALUES (195, 9, 14, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:40:07.589012+13', '2021-10-04 09:40:07.589012+13', NULL, NULL);
INSERT INTO public.application_response VALUES (196, 10, 14, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:40:07.589012+13', '2021-10-04 09:40:07.589012+13', NULL, NULL);
INSERT INTO public.application_response VALUES (197, 11, 14, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:40:07.589012+13', '2021-10-04 09:40:07.589012+13', NULL, NULL);
INSERT INTO public.application_response VALUES (198, 12, 14, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:40:07.589012+13', '2021-10-04 09:40:07.589012+13', NULL, NULL);
INSERT INTO public.application_response VALUES (199, 13, 14, 1, 'DRAFT', '{"text": "nicole_madruga@hotmail.com"}', false, '2021-10-04 09:40:07.589012+13', '2021-10-04 12:57:22.522092+13', NULL, NULL);
INSERT INTO public.application_response VALUES (200, 14, 14, 1, 'DRAFT', '{"hash": "", "text": ""}', NULL, '2021-10-04 09:40:07.589012+13', '2021-10-08 11:37:22.433159+13', NULL, NULL);
INSERT INTO public.application_response VALUES (201, 173, 15, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:54:08.092059+13', '2021-10-04 09:54:08.092059+13', NULL, NULL);
INSERT INTO public.application_response VALUES (202, 174, 15, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:54:08.092059+13', '2021-10-04 09:54:08.092059+13', NULL, NULL);
INSERT INTO public.application_response VALUES (203, 175, 15, NULL, 'DRAFT', NULL, NULL, '2021-10-04 09:54:08.092059+13', '2021-10-04 09:54:08.092059+13', NULL, NULL);
INSERT INTO public.application_response VALUES (204, 176, 16, 1, 'DRAFT', NULL, NULL, '2021-10-04 10:57:44.305915+13', '2022-09-27 15:31:51.425497+13', NULL, NULL);
INSERT INTO public.application_response VALUES (205, 178, 16, 1, 'DRAFT', NULL, NULL, '2021-10-04 10:57:44.305915+13', '2022-09-27 15:32:09.29642+13', NULL, NULL);
INSERT INTO public.application_response VALUES (206, 177, 16, 1, 'DRAFT', '{"text": "*Nenhum selecionado*", "values": {"0": {"key": 0, "text": "admin", "label": "admin", "selected": false, "textNegative": ""}, "1": {"key": 1, "text": "applyUserRegistration", "label": "applyUserRegistration", "selected": false, "textNegative": ""}, "2": {"key": 2, "text": "applyUserEdit", "label": "applyUserEdit", "selected": false, "textNegative": ""}, "3": {"key": 3, "text": "applyGeneral", "label": "applyGeneral", "selected": false, "textNegative": ""}, "4": {"key": 4, "text": "reviewOrgRego", "label": "reviewOrgRego", "selected": false, "textNegative": ""}, "5": {"key": 5, "text": "reviewJoinOrg", "label": "reviewJoinOrg", "selected": false, "textNegative": ""}, "6": {"key": 6, "text": "assignGeneral", "label": "assignGeneral", "selected": false, "textNegative": ""}, "7": {"key": 7, "text": "reviewGeneral", "label": "reviewGeneral", "selected": false, "textNegative": ""}, "8": {"key": 8, "text": "reviewScreening", "label": "reviewScreening", "selected": false, "textNegative": ""}, "9": {"key": 9, "text": "reviewAssessmentSection1Level1", "label": "reviewAssessmentSection1Level1", "selected": false, "textNegative": ""}, "10": {"key": 10, "text": "reviewAssessmentSection2Level1", "label": "reviewAssessmentSection2Level1", "selected": false, "textNegative": ""}, "11": {"key": 11, "text": "reviewAssessmentLevel2", "label": "reviewAssessmentLevel2", "selected": false, "textNegative": ""}, "12": {"key": 12, "text": "reviewFinalDecision", "label": "reviewFinalDecision", "selected": false, "textNegative": ""}, "13": {"key": 13, "text": "applyNonRegistered", "label": "applyNonRegistered", "selected": false, "textNegative": ""}, "14": {"key": 14, "text": "systemManager", "label": "systemManager", "selected": false, "textNegative": ""}}, "textUnselected": "admin, applyUserRegistration, applyUserEdit, applyGeneral, reviewOrgRego, reviewJoinOrg, assignGeneral, reviewGeneral, reviewScreening, reviewAssessmentSection1Level1, reviewAssessmentSection2Level1, reviewAssessmentLevel2, reviewFinalDecision, applyNonRegistered, systemManager", "textMarkdownList": "- *Nenhum selecionado*\n", "selectedValuesArray": [], "unselectedValuesArray": [{"key": 0, "text": "admin", "label": "admin", "selected": false, "textNegative": ""}, {"key": 1, "text": "applyUserRegistration", "label": "applyUserRegistration", "selected": false, "textNegative": ""}, {"key": 2, "text": "applyUserEdit", "label": "applyUserEdit", "selected": false, "textNegative": ""}, {"key": 3, "text": "applyGeneral", "label": "applyGeneral", "selected": false, "textNegative": ""}, {"key": 4, "text": "reviewOrgRego", "label": "reviewOrgRego", "selected": false, "textNegative": ""}, {"key": 5, "text": "reviewJoinOrg", "label": "reviewJoinOrg", "selected": false, "textNegative": ""}, {"key": 6, "text": "assignGeneral", "label": "assignGeneral", "selected": false, "textNegative": ""}, {"key": 7, "text": "reviewGeneral", "label": "reviewGeneral", "selected": false, "textNegative": ""}, {"key": 8, "text": "reviewScreening", "label": "reviewScreening", "selected": false, "textNegative": ""}, {"key": 9, "text": "reviewAssessmentSection1Level1", "label": "reviewAssessmentSection1Level1", "selected": false, "textNegative": ""}, {"key": 10, "text": "reviewAssessmentSection2Level1", "label": "reviewAssessmentSection2Level1", "selected": false, "textNegative": ""}, {"key": 11, "text": "reviewAssessmentLevel2", "label": "reviewAssessmentLevel2", "selected": false, "textNegative": ""}, {"key": 12, "text": "reviewFinalDecision", "label": "reviewFinalDecision", "selected": false, "textNegative": ""}, {"key": 13, "text": "applyNonRegistered", "label": "applyNonRegistered", "selected": false, "textNegative": ""}, {"key": 14, "text": "systemManager", "label": "systemManager", "selected": false, "textNegative": ""}], "textMarkdownPropertyList": "- admin: \n- applyUserRegistration: \n- applyUserEdit: \n- applyGeneral: \n- reviewOrgRego: \n- reviewJoinOrg: \n- assignGeneral: \n- reviewGeneral: \n- reviewScreening: \n- reviewAssessmentSection1Level1: \n- reviewAssessmentSection2Level1: \n- reviewAssessmentLevel2: \n- reviewFinalDecision: \n- applyNonRegistered: \n- systemManager: \n", "textUnselectedMarkdownList": "- admin\n- applyUserRegistration\n- applyUserEdit\n- applyGeneral\n- reviewOrgRego\n- reviewJoinOrg\n- assignGeneral\n- reviewGeneral\n- reviewScreening\n- reviewAssessmentSection1Level1\n- reviewAssessmentSection2Level1\n- reviewAssessmentLevel2\n- reviewFinalDecision\n- applyNonRegistered\n- systemManager\n"}', true, '2021-10-04 10:57:44.305915+13', '2022-09-27 15:31:51.452271+13', NULL, NULL);
INSERT INTO public.application_response VALUES (207, 179, 17, 1, 'DRAFT', NULL, NULL, '2021-10-04 10:57:51.893189+13', '2021-10-04 10:58:37.222868+13', NULL, NULL);
INSERT INTO public.application_response VALUES (208, 180, 17, NULL, 'DRAFT', '""', NULL, '2021-10-04 10:57:51.893189+13', '2021-10-04 10:57:51.893189+13', NULL, NULL);
INSERT INTO public.application_response VALUES (209, 174, 18, 1, 'DRAFT', '{"text": "admiN"}', false, '2022-08-11 10:13:08.263223+12', '2022-08-11 10:15:18.437685+12', NULL, NULL);
INSERT INTO public.application_response VALUES (210, 175, 18, NULL, 'DRAFT', NULL, NULL, '2022-08-11 10:13:08.263223+12', '2022-08-11 10:13:08.263223+12', NULL, NULL);
INSERT INTO public.application_response VALUES (211, 174, 19, 1, 'DRAFT', '{"text": "adMin"}', false, '2022-08-11 10:15:21.574247+12', '2022-08-11 10:15:30.010915+12', NULL, NULL);
INSERT INTO public.application_response VALUES (212, 175, 19, NULL, 'DRAFT', NULL, NULL, '2022-08-11 10:15:21.574247+12', '2022-08-11 10:15:21.574247+12', NULL, NULL);


--
-- Data for Name: application_stage_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.application_stage_history VALUES (1, 1, 1, '2021-08-10 14:14:32.319549+12', true);
INSERT INTO public.application_stage_history VALUES (9, 10, 14, '2021-09-08 19:33:44.722138+12', true);
INSERT INTO public.application_stage_history VALUES (10, 11, 11, '2021-09-08 19:34:27.120166+12', true);
INSERT INTO public.application_stage_history VALUES (11, 12, 10, '2021-09-08 19:35:08.026157+12', true);
INSERT INTO public.application_stage_history VALUES (12, 13, 9, '2021-09-08 19:35:33.781415+12', true);
INSERT INTO public.application_stage_history VALUES (13, 14, 2, '2021-10-04 09:40:07.88981+13', true);
INSERT INTO public.application_stage_history VALUES (14, 15, 15, '2021-10-04 09:54:08.343586+13', true);
INSERT INTO public.application_stage_history VALUES (15, 16, 17, '2021-10-04 10:57:44.842751+13', true);
INSERT INTO public.application_stage_history VALUES (16, 17, 18, '2021-10-04 10:57:52.368001+13', true);
INSERT INTO public.application_stage_history VALUES (17, 18, 15, '2022-08-11 10:13:08.437572+12', true);
INSERT INTO public.application_stage_history VALUES (18, 19, 15, '2022-08-11 10:15:21.714024+12', true);


--
-- Data for Name: application_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.application_status_history VALUES (1, 1, 'DRAFT', '2021-08-10 14:14:32.324262+12', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (9, 9, 'DRAFT', '2021-09-08 19:33:44.725189+12', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (10, 10, 'DRAFT', '2021-09-08 19:34:27.123407+12', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (11, 11, 'DRAFT', '2021-09-08 19:35:08.02865+12', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (12, 12, 'DRAFT', '2021-09-08 19:35:33.783163+12', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (13, 13, 'DRAFT', '2021-10-04 09:40:07.892563+13', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (14, 14, 'DRAFT', '2021-10-04 09:54:08.346977+13', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (15, 15, 'DRAFT', '2021-10-04 10:57:44.849121+13', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (16, 16, 'DRAFT', '2021-10-04 10:57:52.369085+13', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (17, 17, 'DRAFT', '2022-08-11 10:13:08.440729+12', true, DEFAULT);
INSERT INTO public.application_status_history VALUES (18, 18, 'DRAFT', '2022-08-11 10:15:21.717953+12', true, DEFAULT);


--
-- Data for Name: counter; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.counter VALUES (1, 'UserEdit', 103);
INSERT INTO public.counter VALUES (2, 'Demo', 3);
INSERT INTO public.counter VALUES (3, 'OrgRegistration', 8);
INSERT INTO public.counter VALUES (4, 'OrgJoin', 3);
INSERT INTO public.counter VALUES (5, 'CoreActions', 2);
INSERT INTO public.counter VALUES (6, 'UserRegistration', 103);
INSERT INTO public.counter VALUES (7, 'PasswordReset', 108);
INSERT INTO public.counter VALUES (8, 'grantUserPermissions', 2);
INSERT INTO public.counter VALUES (9, 'addToCompany', 2);


--
-- Data for Name: data_table; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: data_view; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.data_view VALUES (1, 'user', 'Users (current organisation)', 'userPublic', NULL, '{"userOrganisations": {"some": {"organisationId": {"equalTo": "$orgId"}}}}', '{usernamePlain,firstName,lastName}', NULL, NULL, '{id,firstName,lastName,passwordHash}', 'fullName', false, 1, NULL, NULL, NULL, NULL);
INSERT INTO public.data_view VALUES (2, 'organisation', 'My Organisations', 'organisation', NULL, '{"userOrganisations": {"some": {"userId": {"equalTo": "$userId"}}}}', '{logoUrl,name,address}', NULL, '{logoUrl,...,members}', '{id,name,isSystemOrg}', 'name', true, 1, NULL, NULL, NULL, NULL);
INSERT INTO public.data_view VALUES (3, 'user', 'Users', 'userRestricted', '{admin,consolProduct}', NULL, NULL, '{id,passwordHash,dateOfBirth,usernamePlain}', '{...,orgs}', '{id,firstName,lastName,passwordHash}', 'fullName', true, 2, NULL, NULL, NULL, NULL);
INSERT INTO public.data_view VALUES (4, 'organisation', 'Organisations', 'organisationAdmin', '{admin}', NULL, '{logoUrl,name,address}', NULL, '{logoUrl,...,members}', '{id,name,isSystemOrg}', 'name', true, 2, NULL, NULL, NULL, NULL);


--
-- Data for Name: data_view_column_definition; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.data_view_column_definition VALUES (2, 'user', 'fullName', 'Full Name', NULL, NULL, NULL, '{"children": ["%1 %2", {"children": ["firstName"], "operator": "objectProperties"}, {"children": ["lastName"], "operator": "objectProperties"}], "operator": "stringSubstitution"}', NULL, NULL, NULL, NULL);
INSERT INTO public.data_view_column_definition VALUES (6, 'organisation', 'logoUrl', 'Logo', 'imageDisplay', '{"url": {"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/public", {"children": ["responses.thisResponse"], "operator": "objectProperties"}], "operator": "+"}, "size": "tiny", "altText": "No logo supplied"}', NULL, '{}', NULL, NULL, NULL, NULL);
INSERT INTO public.data_view_column_definition VALUES (8, 'organisation', 'registrationDocumentation', 'Registration docs', 'fileUpload', '{}', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.data_view_column_definition VALUES (10, 'organisation', 'members', 'Members', NULL, NULL, '{"substitution": "[${user.firstName} ${user.lastName}](/outcomes/user/${user.id})"}', '{"children": ["query getOrgUsers($id:Int!) { userOrganisations(filter: {organisationId: {equalTo: $id}}) { nodes { user { id, firstName, lastName }}}}", "graphQLEndpoint", ["id"], {"children": ["id"], "operator": "objectProperties"}, "userOrganisations"], "operator": "graphQL"}', NULL, NULL, NULL, NULL);
INSERT INTO public.data_view_column_definition VALUES (15, 'user', 'usernamePlain', 'Username', NULL, NULL, NULL, '{"children": ["username"], "operator": "objectProperties"}', NULL, NULL, NULL, NULL);
INSERT INTO public.data_view_column_definition VALUES (19, 'user', 'orgs', 'Member of', NULL, NULL, '{"substitution": "[${organisation.name}](/outcomes/organisation/${organisation.id})"}', '{"children": ["query getUsersOrgs($id: Int!) {  userOrganisations(filter: {userId: {equalTo: $id}}) { nodes { organisation { name, id }}}}", "graphQLEndpoint", ["id"], {"children": ["id"], "operator": "objectProperties"}, "userOrganisations"], "operator": "graphQL"}', NULL, NULL, NULL, NULL);


--
-- Data for Name: element_type_plugin; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: file; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.file VALUES (3, 'CylhAzxRhSX_QjtArq3bi', 'fda.png', NULL, NULL, NULL, NULL, NULL, NULL, false, false, false, false, 'fda_CylhAzxRhSX_QjtArq3bi.png', 'fda_CylhAzxRhSX_QjtArq3bi.png', NULL, false, '2021-10-04 15:23:06.342206+13');
INSERT INTO public.file VALUES (4, '6t0oVIzvHe45VyVk4NiMO', 'conforma_logo_wide_white_1024.png', NULL, NULL, NULL, NULL, NULL, NULL, false, false, false, false, 'logos/conforma_logo_wide_white_1024_6t0oVIzvHe45VyVk4NiMO.png', 'logos/conforma_logo_wide_white_1024_6t0oVIzvHe45VyVk4NiMO_thumb.jpg', 'image/png', false, '2022-06-28 17:50:38.769376+12');
INSERT INTO public.file VALUES (5, 'FatzcVDjgxuAcdwQf1h_u', 'conforma_logo_wide_1024.png', NULL, NULL, NULL, NULL, NULL, NULL, false, false, false, false, 'logos/conforma_logo_wide_1024_FatzcVDjgxuAcdwQf1h_u.png', 'logos/conforma_logo_wide_1024_FatzcVDjgxuAcdwQf1h_u_thumb.jpg', 'image/png', false, '2022-06-28 17:52:09.758334+12');


--
-- Data for Name: filter; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.filter VALUES (1, 'approveApplications', 'Approved applications', '{"outcome": "APPROVED"}', 'APPLY');
INSERT INTO public.filter VALUES (2, 'submittedApplications', 'Submitted applications', '{"status": "submitted"}', 'APPLY');
INSERT INTO public.filter VALUES (3, 'draftApplications', 'Draft applications', '{"status": "draft"}', 'APPLY');
INSERT INTO public.filter VALUES (4, 'changeRequestApplications', 'Applications pending action', '{"status": "Changes Required"}', 'APPLY');
INSERT INTO public.filter VALUES (5, 'availableForSelfAssignmentReviews', 'Applications available for self-assignment', '{"reviewerAction": "SELF_ASSIGN"}', 'REVIEW');
INSERT INTO public.filter VALUES (6, 'readyToStartReviews', 'Applications pending review', '{"reviewerAction": "START_REVIEW"}', 'REVIEW');
INSERT INTO public.filter VALUES (7, 'readyToRestartReviews', 'Applications with updates to review', '{"reviewerAction": "RESTART_REVIEW"}', 'REVIEW');
INSERT INTO public.filter VALUES (8, 'draftReviews', 'Draft reviews of applications', '{"reviewerAction": "CONTINUE_REVIEW"}', 'REVIEW');
INSERT INTO public.filter VALUES (9, 'changeRequestReviews', 'Reviews pending action', '{"reviewerAction": "UPDATE_REVIEW"}', 'REVIEW');
INSERT INTO public.filter VALUES (10, 'awaitingAssignments', 'Reviews awaiting assignment', '{"assignerAction": "ASSIGN"}', 'ASSIGN');
INSERT INTO public.filter VALUES (11, 'availableForReAssignments', 'Reviews available for re-assignment', '{"assignerAction": "RE_ASSIGN"}', 'ASSIGN');


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organisation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.organisation VALUES (1, 'Food and Drug Authority', 'fda', NULL, '/file?uid=CylhAzxRhSX_QjtArq3bi', true);


--
-- Data for Name: permission_join; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permission_join VALUES (1, 1, NULL, 2, true);
INSERT INTO public.permission_join VALUES (2, 2, 1, 4, true);
INSERT INTO public.permission_join VALUES (3, 2, 1, 7, true);
INSERT INTO public.permission_join VALUES (4, 2, 1, 5, true);
INSERT INTO public.permission_join VALUES (5, 2, 1, 9, true);
INSERT INTO public.permission_join VALUES (6, 2, 1, 10, true);
INSERT INTO public.permission_join VALUES (7, 2, 1, 11, true);
INSERT INTO public.permission_join VALUES (8, 2, 1, 12, true);
INSERT INTO public.permission_join VALUES (9, 2, 1, 13, true);
INSERT INTO public.permission_join VALUES (11, 1, NULL, 14, true);
INSERT INTO public.permission_join VALUES (13, 2, 1, 1, true);
INSERT INTO public.permission_join VALUES (14, 3, 1, 15, true);
INSERT INTO public.permission_join VALUES (15, 2, 1, 15, true);


--
-- Data for Name: permission_name; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permission_name VALUES (1, 'admin', 'Internal user to be allowed to access areas for System admin settings', 8, true);
INSERT INTO public.permission_name VALUES (2, 'applyUserRegistration', 'External user to be allowed applying for User registration template (public)', 1, false);
INSERT INTO public.permission_name VALUES (3, 'applyUserEdit', 'External user to be allowed applying for User edit template (registed users)', 2, false);
INSERT INTO public.permission_name VALUES (4, 'applyGeneral', 'External user to be allowed applying to general types of templates', 2, false);
INSERT INTO public.permission_name VALUES (5, 'reviewOrgRego', 'Internal user to be allowed reviewing Organisation registration templates', 5, true);
INSERT INTO public.permission_name VALUES (6, 'reviewJoinOrg', 'Internal user to be allowed reviewing User join Organisation templates', 4, true);
INSERT INTO public.permission_name VALUES (7, 'assignGeneral', 'Internal user to be allowed assigning reviewers to general types of templates', 7, true);
INSERT INTO public.permission_name VALUES (8, 'reviewGeneral', 'Internal user to be allowed reviewing general types of templates', 5, true);
INSERT INTO public.permission_name VALUES (9, 'reviewScreening', 'Internal user to be allowed reviewing stage 1 on general types of templates', 5, true);
INSERT INTO public.permission_name VALUES (10, 'reviewAssessmentSection1Level1', 'Internal user to be allowed reviewing stage 2 - only section 1 - on general types of templates', 5, true);
INSERT INTO public.permission_name VALUES (11, 'reviewAssessmentSection2Level1', 'Internal user to be allowed reviewing stage 2 - only section 2 - on general types of templates', 5, true);
INSERT INTO public.permission_name VALUES (12, 'reviewAssessmentLevel2', 'Internal user to be allowed consolidating stage 2 on general types of templates', 5, true);
INSERT INTO public.permission_name VALUES (13, 'reviewFinalDecision', 'Internal user to be allowed making a final decision on last stage of general types of templates', 6, true);
INSERT INTO public.permission_name VALUES (14, 'applyNonRegistered', 'Permission for not registered users be allowed to apply for User Registration template', 1, false);
INSERT INTO public.permission_name VALUES (15, 'systemManager', 'Access to system management tasks such as document and user-permission configuration', 2, true);


--
-- Data for Name: permission_policy; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.permission_policy VALUES (1, 'applyNonRegistered', NULL, '{"application": {"view": {"user_id": 1, "session_id": "jwtUserDetails_text_sessionId", "template_id": "jwtPermission_array_bigint_template_ids"}}}', 'APPLY', false, NULL);
INSERT INTO public.permission_policy VALUES (2, 'applyUserRestricted', NULL, '{"application": {"view": {"user_id": "jwtUserDetails_bigint_userId", "template_id": "jwtPermission_array_bigint_template_ids"}}}', 'APPLY', false, NULL);
INSERT INTO public.permission_policy VALUES (3, 'applyOrgRestricted', NULL, '{"application": {"view": {"org_id": "jwtUserDetails_bigint_orgId", "template_id": "jwtPermission_array_bigint_template_ids"}}}', 'APPLY', false, NULL);
INSERT INTO public.permission_policy VALUES (4, 'reviewOrgRestricted', NULL, '{"review": {"view": {"reviewer_id": "jwtUserDetails_bigint_userId"}}, "application": {"view": {"org_id": "jwtUserDetails_bigint_orgId", "template_id": "jwtPermission_array_bigint_template_ids"}}, "review_assignment": {"view": {"reviewer_id": "jwtUserDetails_bigint_userId"}}}', 'REVIEW', false, NULL);
INSERT INTO public.permission_policy VALUES (5, 'reviewBasic', NULL, '{"review": {"view": {"application_id": {"$in": {"$select": {"$from": "review_assignment", "$where": {"reviewer_id": "jwtUserDetails_bigint_userId"}, "application_id": true}}}}}, "application": {"view": {"id": {"$in": {"$select": {"$from": "review_assignment", "$where": {"reviewer_id": "jwtUserDetails_bigint_userId"}, "application_id": true}}}, "template_id": "jwtPermission_array_bigint_template_ids"}}, "review_assignment": {"view": {"reviewer_id": "jwtUserDetails_bigint_userId"}}}', 'REVIEW', false, NULL);
INSERT INTO public.permission_policy VALUES (6, 'reviewAdvanced', NULL, '{"review": {"view": {"application_id": {"$in": {"$select": {"$from": "review_assignment", "$where": {"reviewer_id": "jwtUserDetails_bigint_userId"}, "application_id": true}}}}}, "application": {"view": {"id": {"$in": {"$select": {"$from": "review_assignment", "$where": {"reviewer_id": "jwtUserDetails_bigint_userId"}, "application_id": true}}}, "template_id": "jwtPermission_array_bigint_template_ids"}}, "review_assignment": {"view": {"template_id": "jwtPermission_array_bigint_template_ids"}}}', 'REVIEW', false, NULL);
INSERT INTO public.permission_policy VALUES (7, 'assignBasic', NULL, '{"review": {"view": {"review_assignment_id": {"$in": {"$select": {"id": true, "$from": "review_assignment", "$where": {"template_id": "jwtPermission_array_bigint_template_ids"}}}}}}, "application": {"view": {"id": {"$in": {"$select": {"$from": "review_assignment", "$where": {"id": {"$in": {"$select": {"$from": "review_assignment_assigner_join", "$where": {"assigner_id": "jwtUserDetails_bigint_userId"}, "review_assignment_id": true}}}}, "application_id": true}}}, "template_id": "jwtPermission_array_bigint_template_ids"}}, "review_assignment": {"view": {"id": {"$in": {"$select": {"$from": "review_assignment_assigner_join", "$where": {"assigner_id": "jwtUserDetails_bigint_userId"}, "review_assignment_id": true}}}, "template_id": "jwtPermission_array_bigint_template_ids"}}}', 'ASSIGN', false, NULL);
INSERT INTO public.permission_policy VALUES (8, 'admin', NULL, '{"application": {"view": {"template_id": {"$gte": 0}}}}', 'APPLY', true, NULL);


--
-- Data for Name: review; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: review_assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: review_assignment_assigner_join; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: review_decision; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: review_response; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: review_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: system_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.system_info VALUES (2, 'version', '"0.1.1-0"', '2022-02-21 15:44:20.129076+13');
INSERT INTO public.system_info VALUES (3, 'version', '"0.2.0-27"', '2022-05-25 14:46:41.70015+12');
INSERT INTO public.system_info VALUES (4, 'version', '"0.2.0"', '2022-06-02 15:42:17.352887+12');
INSERT INTO public.system_info VALUES (5, 'version', '"0.3.0"', '2022-06-28 17:47:48.480302+12');
INSERT INTO public.system_info VALUES (6, 'version', '"0.3.1"', '2022-08-05 14:55:38.468024+12');
INSERT INTO public.system_info VALUES (7, 'version', '"0.4.0"', '2022-08-09 09:04:03.365202+12');
INSERT INTO public.system_info VALUES (8, 'version', '"0.4.0"', '2022-08-09 11:52:09.531658+12');
INSERT INTO public.system_info VALUES (9, 'version', '"0.4.2-0"', '2022-08-11 10:10:05.334676+12');
INSERT INTO public.system_info VALUES (10, 'version', '"0.4.3"', '2022-08-26 20:58:41.134134+12');
INSERT INTO public.system_info VALUES (11, 'version', '"0.4.4-1"', '2022-08-29 14:42:00.27181+12');
INSERT INTO public.system_info VALUES (12, 'version', '"0.4.5-2"', '2022-09-02 14:14:10.808863+12');
INSERT INTO public.system_info VALUES (14, 'snapshot', '"core_templates"', '2022-09-02 14:16:21.70272+12');
INSERT INTO public.system_info VALUES (15, 'version', '"0.4.5-5"', '2022-09-07 17:12:18.434533+12');
INSERT INTO public.system_info VALUES (16, 'snapshot', '"core_templates"', '2022-09-07 17:12:18.598825+12');
INSERT INTO public.system_info VALUES (17, 'snapshot', '"core_templates"', '2022-09-07 18:09:06.216504+12');
INSERT INTO public.system_info VALUES (18, 'version', '"0.4.5-13"', '2022-09-19 14:31:06.195383+12');
INSERT INTO public.system_info VALUES (19, 'snapshot', '"core_templates"', '2022-09-19 14:31:06.36259+12');
INSERT INTO public.system_info VALUES (20, 'version', '"0.4.5-16"', '2022-09-27 15:30:47.097853+13');
INSERT INTO public.system_info VALUES (21, 'snapshot', '"core_templates"', '2022-09-27 15:30:47.282514+13');
INSERT INTO public.system_info VALUES (22, 'version', '"0.4.6-1"', '2022-10-06 10:30:53.462257+13');
INSERT INTO public.system_info VALUES (23, 'snapshot', '"core_templates"', '2022-10-06 10:30:53.571952+13');
INSERT INTO public.system_info VALUES (24, 'version', '"0.4.6-3"', '2022-10-11 10:32:54.304393+13');
INSERT INTO public.system_info VALUES (25, 'snapshot', '"core_templates"', '2022-10-11 10:32:54.384871+13');
INSERT INTO public.system_info VALUES (26, 'version', '"0.5.0-3"', '2022-11-24 09:46:05.301802+13');
INSERT INTO public.system_info VALUES (27, 'snapshot', '"core_templates"', '2022-11-24 09:46:05.431923+13');


--
-- Data for Name: template; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template VALUES (1, 'Edit User Details', 'Edit Users Details', 'UserEdit', true, true, NULL, 'AVAILABLE', '"Thanks for updating your details. You will need to log out and log back into the system for the changes to take effect."', NULL, 4, '2021-08-10 14:13:36.778636+12', 1);
INSERT INTO public.template VALUES (2, 'User Registration', NULL, 'UserRegistration', true, true, NULL, 'AVAILABLE', '"Thanks. Please check your email to verify your registration."', NULL, NULL, '2021-08-10 14:13:37.055372+12', 1);
INSERT INTO public.template VALUES (11, 'Reset Password', '', 'PasswordReset', false, true, NULL, 'AVAILABLE', '{"children": [{"children": [1, {"children": ["applicationData.current.stage.number", null], "operator": "objectProperties"}], "operator": "="}, "Thanks. Please click the link sent your email to change your password.", "Password changed"], "operator": "?"}', NULL, NULL, '2021-09-08 12:43:22.001461+12', 2);
INSERT INTO public.template VALUES (12, 'Grant User Permissions', NULL, 'grantUserPermissions', true, false, '""', 'AVAILABLE', '"Thank you! Permissions have been updated."', NULL, 7, '2021-08-16 20:28:45.381906+12', 1);
INSERT INTO public.template VALUES (13, 'Add User to Company', NULL, 'addToCompany', true, false, '""', 'AVAILABLE', '"Thank you! User has been added."', NULL, 7, '2021-09-22 16:18:42.49605+12', 1);
INSERT INTO public.template VALUES (7, 'Company Registration', 'Companies Registrations', 'OrgRegistration', true, true, '"## You will need the following documents ready for upload:\n- Proof of organisation name\n- Proof of organisation address\n- Organisation licence document"', 'AVAILABLE', '"Thank you! Your application has been submitted."', NULL, 2, '2021-09-08 19:31:58.620695+12', 3);
INSERT INTO public.template VALUES (8, 'Join Company', NULL, 'OrgJoin', false, false, '"## You will need the following documents ready for upload:\n- PhotoID"', 'AVAILABLE', '"Thank you! Your application has been submitted."', NULL, 2, '2021-09-08 19:32:36.975294+12', 2);
INSERT INTO public.template VALUES (9, 'Demo -- Feature Showcase', 'Demo -- Feature Showcases', 'Demo', false, true, '{"children": ["## This is the general registration for feature showcase\nHi, %1. You will need to provide:\n- Proof of identity (Passport, Drivers license)\n- Proof of your medical certification\n- Drug ingredient list\n- Product images\n- Packging images", {"children": ["currentUser.firstName"], "operator": "objectProperties"}], "operator": "stringSubstitution"}', 'AVAILABLE', '{"children": ["### Application Submitted!\nThanks, %1.", {"children": ["currentUser.firstName"], "operator": "objectProperties"}], "operator": "stringSubstitution"}', NULL, 1, '2021-09-08 19:33:01.96505+12', 2);
INSERT INTO public.template VALUES (10, 'Sample Templates', 'Sample template applications', 'CoreActions', true, true, '"## You will need the following documents ready for upload:\n- <Add list of documents to upload>"', 'AVAILABLE', '"Thank you! Your application has been submitted."', NULL, 1, '2021-09-08 19:33:33.648821+12', 2);


--
-- Data for Name: template_action; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_action VALUES (1, 1, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "UE-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterInit": 100, "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "customFields": {}, "updateRecord": true}', NULL, 1);
INSERT INTO public.template_action VALUES (2, 1, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', NULL, 2);
INSERT INTO public.template_action VALUES (3, 1, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (4, 1, NULL, 'modifyRecord', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"id": {"children": ["applicationData.userId"], "operator": "objectProperties"}, "email": {"children": ["applicationData.responses.Q4.text"], "operator": "objectProperties"}, "username": {"children": ["applicationData.responses.Q3.text"], "operator": "objectProperties"}, "last_name": {"children": ["applicationData.responses.Q2.text"], "operator": "objectProperties"}, "tableName": "user", "first_name": {"children": ["applicationData.responses.Q1.text"], "operator": "objectProperties"}, "password_hash": {"children": [{"children": ["applicationData.responses.passwordCheckbox.values.0.selected"], "operator": "objectProperties"}, {"children": ["applicationData.responses.newPassword.hash"], "operator": "objectProperties"}, null], "operator": "?"}}', NULL, 1);
INSERT INTO public.template_action VALUES (5, 1, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": {"value": "COMPLETED"}}', NULL, 2);
INSERT INTO public.template_action VALUES (6, 1, NULL, 'changeOutcome', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newOutcome": {"value": "APPROVED"}}', NULL, 3);
INSERT INTO public.template_action VALUES (7, 2, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "UR-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterInit": 100, "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "customFields": {}, "updateRecord": true}', NULL, 1);
INSERT INTO public.template_action VALUES (8, 2, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', NULL, 2);
INSERT INTO public.template_action VALUES (9, 2, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 1);
INSERT INTO public.template_action VALUES (10, 2, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 1);
INSERT INTO public.template_action VALUES (11, 2, NULL, 'createVerification', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"expiry": 4, "message": {"children": ["## Registration complete!\n\nThanks, %1.\n\nPlease log in to continue.", {"children": ["applicationData.responses.Q1FirstName.text", ""], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', NULL, 2);
INSERT INTO public.template_action VALUES (12, 2, NULL, 'sendNotification', '', 'ON_APPLICATION_SUBMIT', 'true', '{"email": {"children": ["applicationData.responses.Q4Email.text", ""], "operator": "objectProperties"}, "message": {"children": ["Hi %1,\n\nplease confirm your user account registration by clicking (or copy-pasting) the following link:\n\n[%2%3](%2%3)", {"children": ["applicationData.responses.Q1FirstName.text", ""], "operator": "objectProperties"}, {"children": ["%1%2", {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, "/verify?uid="], "operator": "stringSubstitution"}, {"children": ["outputCumulative.verification.unique_id"], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": "User Registration - verify account", "fromName": "Application Manager", "fromEmail": "no-reply@sussol.net"}', '', 3);
INSERT INTO public.template_action VALUES (13, 2, NULL, 'modifyRecord', NULL, 'ON_VERIFICATION', 'true', '{"email": {"children": ["applicationData.responses.Q4Email.text"], "operator": "objectProperties"}, "username": {"children": ["applicationData.responses.Q3Username.text"], "operator": "objectProperties"}, "last_name": {"children": ["applicationData.responses.Q2LastName.text"], "operator": "objectProperties"}, "tableName": "user", "first_name": {"children": ["applicationData.responses.Q1FirstName.text"], "operator": "objectProperties"}, "password_hash": {"children": ["applicationData.responses.Q5Password.hash"], "operator": "objectProperties"}}', NULL, 1);
INSERT INTO public.template_action VALUES (14, 2, NULL, 'changeStatus', NULL, 'ON_VERIFICATION', 'true', '{"newStatus": {"value": "COMPLETED"}}', NULL, 2);
INSERT INTO public.template_action VALUES (15, 2, NULL, 'changeOutcome', NULL, 'ON_VERIFICATION', 'true', '{"newOutcome": {"value": "APPROVED"}}', NULL, 3);
INSERT INTO public.template_action VALUES (16, 2, NULL, 'grantPermissions', NULL, 'ON_VERIFICATION', 'true', '{"orgId": null, "username": {"children": ["applicationData.responses.Q3Username.text"], "operator": "objectProperties"}, "permissionNames": ["applyGeneral"]}', '', 4);
INSERT INTO public.template_action VALUES (120, 7, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "S-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "updateRecord": true}', NULL, 1);
INSERT INTO public.template_action VALUES (121, 7, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', NULL, 2);
INSERT INTO public.template_action VALUES (122, 7, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (123, 7, NULL, 'changeStatus', NULL, 'ON_APPLICATION_RESTART', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (124, 7, NULL, 'changeStatus', NULL, 'ON_REVIEW_RESTART', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (125, 7, NULL, 'changeStatus', NULL, 'ON_REVIEW_CREATE', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (127, 7, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 1);
INSERT INTO public.template_action VALUES (128, 7, NULL, 'trimResponses', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 2);
INSERT INTO public.template_action VALUES (129, 7, NULL, 'generateReviewAssignments', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (131, 7, NULL, 'cleanupFiles', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 5);
INSERT INTO public.template_action VALUES (132, 7, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 50);
INSERT INTO public.template_action VALUES (133, 7, NULL, 'trimResponses', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"timestamp": {"children": ["outputCumulative.reviewStatusHistoryTimestamp"], "operator": "objectProperties"}}', NULL, 51);
INSERT INTO public.template_action VALUES (135, 7, NULL, 'incrementStage', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, {"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}], "operator": "OR"}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', NULL, NULL, 53);
INSERT INTO public.template_action VALUES (136, 7, NULL, 'generateReviewAssignments', NULL, 'ON_REVIEW_SUBMIT', 'true', NULL, NULL, 54);
INSERT INTO public.template_action VALUES (137, 7, NULL, 'updateReviewVisibility', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', NULL, NULL, 6);
INSERT INTO public.template_action VALUES (138, 7, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{"isReview": false, "newStatus": "CHANGES_REQUIRED"}', NULL, 55);
INSERT INTO public.template_action VALUES (139, 7, NULL, 'changeOutcome', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, {"type": "string", "children": ["CONFORM", "NON_CONFORM"], "operator": "OR"}], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.isLastStage", null], "operator": "objectProperties"}], "operator": "AND"}', '{"newOutcome": {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, "APPROVED", "REJECTED"], "operator": "?"}}', '**CORE-ACTION** Change application outcome when last level and last stage - usually a final decision - submits a review as CONFORM or NON_CONFORM. Outcome will be APPROVED or REJECTED accordingly', 56);
INSERT INTO public.template_action VALUES (141, 7, NULL, 'generateName', NULL, 'DEV_TEST', 'true', '{"formatExpression": "${applicationData.templateName} — ${applicationData.applicationSerial}"}', NULL, 1);
INSERT INTO public.template_action VALUES (143, 7, NULL, 'modifyRecord', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"name": {"children": ["applicationData.responses.name.text"], "operator": "objectProperties"}, "address": {"children": ["applicationData.responses.physAdd.text"], "operator": "objectProperties"}, "logo_url": {"children": ["", {"children": ["applicationData.responses.logo.files.fileUrl"], "operator": "objectProperties"}], "operator": "CONCAT"}, "tableName": "organisation", "registration": {"children": ["applicationData.responses.rego.text"], "operator": "objectProperties"}, "registration_documentation": {"children": ["applicationData.responses.regoDoc"], "operator": "objectProperties"}}', NULL, 101);
INSERT INTO public.template_action VALUES (144, 7, NULL, 'joinUserOrg', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"user_id": {"children": ["applicationData.userId"], "operator": "objectProperties"}, "user_role": "Owner", "organisation_id": {"children": ["outputCumulative.organisation.id"], "operator": "objectProperties"}}', NULL, 102);
INSERT INTO public.template_action VALUES (145, 7, NULL, 'grantPermissions', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"orgName": {"children": ["outputCumulative.organisation.name"], "operator": "objectProperties"}, "username": {"children": ["applicationData.username"], "operator": "objectProperties"}, "permissionNames": ["reviewJoinOrg"]}', NULL, 103);
INSERT INTO public.template_action VALUES (146, 8, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "S-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "updateRecord": true}', NULL, 1);
INSERT INTO public.template_action VALUES (147, 8, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', NULL, 2);
INSERT INTO public.template_action VALUES (148, 8, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (149, 8, NULL, 'changeStatus', NULL, 'ON_APPLICATION_RESTART', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (150, 8, NULL, 'changeStatus', NULL, 'ON_REVIEW_RESTART', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (151, 8, NULL, 'changeStatus', NULL, 'ON_REVIEW_CREATE', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (153, 8, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 1);
INSERT INTO public.template_action VALUES (154, 8, NULL, 'trimResponses', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 2);
INSERT INTO public.template_action VALUES (155, 8, NULL, 'generateReviewAssignments', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (157, 8, NULL, 'cleanupFiles', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 5);
INSERT INTO public.template_action VALUES (158, 8, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 50);
INSERT INTO public.template_action VALUES (159, 8, NULL, 'trimResponses', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"timestamp": {"children": ["outputCumulative.reviewStatusHistoryTimestamp"], "operator": "objectProperties"}}', NULL, 51);
INSERT INTO public.template_action VALUES (161, 8, NULL, 'incrementStage', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, {"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}], "operator": "OR"}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', NULL, NULL, 53);
INSERT INTO public.template_action VALUES (162, 8, NULL, 'generateReviewAssignments', NULL, 'ON_REVIEW_SUBMIT', 'true', NULL, NULL, 54);
INSERT INTO public.template_action VALUES (163, 8, NULL, 'updateReviewVisibility', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', NULL, NULL, 6);
INSERT INTO public.template_action VALUES (164, 8, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{"isReview": false, "newStatus": "CHANGES_REQUIRED"}', NULL, 55);
INSERT INTO public.template_action VALUES (165, 8, NULL, 'changeOutcome', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, {"type": "string", "children": ["CONFORM", "NON_CONFORM"], "operator": "OR"}], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.isLastStage", null], "operator": "objectProperties"}], "operator": "AND"}', '{"newOutcome": {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, "APPROVED", "REJECTED"], "operator": "?"}}', '**CORE-ACTION** Change application outcome when last level and last stage - usually a final decision - submits a review as CONFORM or NON_CONFORM. Outcome will be APPROVED or REJECTED accordingly', 56);
INSERT INTO public.template_action VALUES (169, 8, NULL, 'modifyRecord', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"id": {"children": ["applicationData.applicationId"], "operator": "objectProperties"}, "org_id": {"children": ["applicationData.responses.S1Q1.selection.id"], "operator": "objectProperties"}, "tableName": "application"}', NULL, NULL);
INSERT INTO public.template_action VALUES (170, 8, NULL, 'joinUserOrg', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"user_id": {"children": ["applicationData.userId"], "operator": "objectProperties"}, "organisation_id": {"children": ["applicationData.responses.S1Q1.selection.id"], "operator": "objectProperties"}}', NULL, 120);
INSERT INTO public.template_action VALUES (171, 8, NULL, 'grantPermissions', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"orgName": {"children": ["applicationData.responses.S1Q1.selection.name"], "operator": "objectProperties"}, "username": {"children": ["applicationData.username"], "operator": "objectProperties"}, "permissionNames": ["canApplyDrugRego"]}', NULL, 130);
INSERT INTO public.template_action VALUES (173, 8, NULL, 'sendNotification', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"message": {"children": ["### Congratulations, %1!\n\nYour application to join organisation %2 has been APPROVED.\n\n[Application Dashboard](%3)\n\nPlease find attached the ID file you uploaded (testing attachment handling)", {"children": ["applicationData.firstName", ""], "operator": "objectProperties"}, {"children": ["applicationData.responses.S1Q1.text", ""], "operator": "objectProperties"}, "http://localhost:3000"], "operator": "stringSubstitution"}, "subject": {"children": ["Application approved: %1", {"children": ["applicationData.applicationSerial", ""], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "fromName": "Application Manager", "fromEmail": "no-reply@sussol.net", "attachments": {"children": ["applicationData.responses.IDUpload.files.uniqueId"], "operator": "objectProperties"}}', NULL, 120);
INSERT INTO public.template_action VALUES (174, 9, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "S-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "updateRecord": true}', NULL, 1);
INSERT INTO public.template_action VALUES (175, 9, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', NULL, 2);
INSERT INTO public.template_action VALUES (176, 9, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (177, 9, NULL, 'changeStatus', NULL, 'ON_APPLICATION_RESTART', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (178, 9, NULL, 'changeStatus', NULL, 'ON_REVIEW_RESTART', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (179, 9, NULL, 'changeStatus', NULL, 'ON_REVIEW_CREATE', 'true', '{"newStatus": "DRAFT"}', NULL, 1);
INSERT INTO public.template_action VALUES (181, 9, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 1);
INSERT INTO public.template_action VALUES (182, 9, NULL, 'trimResponses', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 2);
INSERT INTO public.template_action VALUES (183, 9, NULL, 'generateReviewAssignments', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 3);
INSERT INTO public.template_action VALUES (185, 9, NULL, 'cleanupFiles', NULL, 'ON_APPLICATION_SUBMIT', 'true', NULL, NULL, 5);
INSERT INTO public.template_action VALUES (187, 9, NULL, 'trimResponses', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"timestamp": {"children": ["outputCumulative.reviewStatusHistoryTimestamp"], "operator": "objectProperties"}}', NULL, 51);
INSERT INTO public.template_action VALUES (189, 9, NULL, 'incrementStage', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, {"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}], "operator": "OR"}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', NULL, NULL, 53);
INSERT INTO public.template_action VALUES (190, 9, NULL, 'generateReviewAssignments', NULL, 'ON_REVIEW_SUBMIT', 'true', NULL, NULL, 54);
INSERT INTO public.template_action VALUES (191, 9, NULL, 'updateReviewVisibility', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', NULL, NULL, 6);
INSERT INTO public.template_action VALUES (192, 9, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{"isReview": false, "newStatus": "CHANGES_REQUIRED"}', NULL, 55);
INSERT INTO public.template_action VALUES (193, 9, NULL, 'changeOutcome', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, {"type": "string", "children": ["CONFORM", "NON_CONFORM"], "operator": "OR"}], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.isLastStage", null], "operator": "objectProperties"}], "operator": "AND"}', '{"newOutcome": {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, "APPROVED", "REJECTED"], "operator": "?"}}', '**CORE-ACTION** Change application outcome when last level and last stage - usually a final decision - submits a review as CONFORM or NON_CONFORM. Outcome will be APPROVED or REJECTED accordingly', 56);
INSERT INTO public.template_action VALUES (195, 9, NULL, 'generateName', NULL, 'DEV_TEST', 'true', '{"formatExpression": "${applicationData.templateName} — ${applicationData.applicationSerial}"}', NULL, 1);
INSERT INTO public.template_action VALUES (196, 9, NULL, 'cLog', NULL, 'ON_APPLICATION_SUBMIT', '{"value": true}', '{"message": {"value": "Testing parallel actions -- This message is Asynchronous. \nEven though it is last in the Actions list, it''ll probably appear first."}}', NULL, NULL);
INSERT INTO public.template_action VALUES (197, 10, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "S-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "updateRecord": true}', '**CORE-ACTION** Generate serial for application when created', 1);
INSERT INTO public.template_action VALUES (198, 10, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', '**CORE-ACTION** Generate name for application wen created', 2);
INSERT INTO public.template_action VALUES (199, 10, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', '{}', '**CORE-ACTION** Increment to first stage when application is created', 3);
INSERT INTO public.template_action VALUES (200, 10, NULL, 'changeStatus', NULL, 'ON_APPLICATION_RESTART', 'true', '{"newStatus": "DRAFT"}', '**CORE-ACTION** Change application status from CHANGES REQUIRED to DRAFT when the applicant restarts one application with  to do updates (as requested in review).', 1);
INSERT INTO public.template_action VALUES (201, 10, NULL, 'changeStatus', NULL, 'ON_REVIEW_RESTART', 'true', '{"newStatus": "DRAFT"}', '**CORE-ACTION** Change review status to DRAFT when the reviewer clicks to re-review a previous review made which has new status as PENDING or CHANGES REQUESTED. Previous status depends if is coming from lower level or applicant (PENDING) or if is coming back from upper level reviewer (CHANGES REQUESTED)', 1);
INSERT INTO public.template_action VALUES (202, 10, NULL, 'changeStatus', NULL, 'ON_REVIEW_CREATE', 'true', '{"newStatus": "DRAFT"}', '**CORE-ACTION** Change review status to DRAFT when the reviewer clicks to start one assignment (and not locked) new review', 1);
INSERT INTO public.template_action VALUES (204, 10, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', '**CORE-ACTION** Change application status from DRAFT to SUBMITTED when the applicant submits the application', 1);
INSERT INTO public.template_action VALUES (205, 10, NULL, 'trimResponses', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{}', '**CORE-ACTION** Remove duplicated and unchanged responses when application is re-submitted by the applicant.', 2);
INSERT INTO public.template_action VALUES (206, 10, NULL, 'generateReviewAssignments', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{}', '**CORE-ACTION** Generate level 1 review assignments in current stage after application is submitted by the applicant ', 3);
INSERT INTO public.template_action VALUES (208, 10, NULL, 'cleanupFiles', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{}', '**CORE-ACTION** Garbage collector for files uploaded and removed by the applicant', 5);
INSERT INTO public.template_action VALUES (209, 10, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', '**CORE-ACTION** Change review status to SUBMITTED when the reviewer submits', 6);
INSERT INTO public.template_action VALUES (210, 10, NULL, 'trimResponses', NULL, 'ON_REVIEW_SUBMIT', 'true', '{"timestamp": {"children": ["outputCumulative.reviewStatusHistoryTimestamp"], "operator": "objectProperties"}}', '**CORE-ACTION** Remove duplicated and unchanged responses or ones without a decision made when review is re-submitted by the reviewer.', 50);
INSERT INTO public.template_action VALUES (212, 10, NULL, 'incrementStage', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, {"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}], "operator": "OR"}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{}', '**CORE-ACTION** Increment stage of application when last level reviewer submits review with decision of CONFORM or NON_CONFORM', 52);
INSERT INTO public.template_action VALUES (213, 10, NULL, 'generateReviewAssignments', NULL, 'ON_REVIEW_SUBMIT', 'true', '{}', '**CORE-ACTION** Generate next level (in current stage) of review assignments after one reviewer submits a review to next level - when applicable', 53);
INSERT INTO public.template_action VALUES (214, 10, NULL, 'updateReviewVisibility', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{}', '**CORE-ACTION** Allow visibility to review responses (always level 1) on the current stage that were DECLINED to show to applicant after review is submitted with decision of LIST_OF_QUESTIONS', 54);
INSERT INTO public.template_action VALUES (215, 10, NULL, 'changeStatus', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{"isReview": false, "newStatus": "CHANGES_REQUIRED"}', '**CORE-ACTION** Change application status to CHANGES_REQUIRED once a last level reviewer submits with decision of LIST_OF_QUESTIONS', 55);
INSERT INTO public.template_action VALUES (216, 10, NULL, 'changeOutcome', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, {"children": ["applicationData.reviewData.isLastStage"], "operator": "objectProperties"}], "operator": "AND"}, {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}], "operator": "OR"}', '{"newOutcome": {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "CONFORM"], "operator": "="}, "APPROVED", "REJECTED"], "operator": "?"}}', '**CORE-ACTION** Change application outcome when last level and last stage - usually a final decision - submits a review as CONFORM or NON_CONFORM. Outcome will be APPROVED or REJECTED accordingly', 56);
INSERT INTO public.template_action VALUES (218, 10, NULL, 'cLog', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"message": {"children": ["Application %1 was submitted of template code %2", "applicationData.applicationSerial", "applicationData.templateCode"], "operator": "stringSubstitution"}}', 'Example: console log with application serial and template code', 6);
INSERT INTO public.template_action VALUES (219, 10, NULL, 'modifyRecord', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"data": {"name": "responses.name.text", "address": "responses.physAdd.text", "registration": "responses.rego.text", "registration_documentation": "responses.regoDoc"}, "logo_url": {"children": ["", {"children": ["applicationData.responses.logo.files.fileUrl"], "operator": "objectProperties"}], "operator": "CONCAT"}, "tableName": "organisation"}', 'Example: action to modify record in database using fields from application when outcome is change to APPROVED ', 101);
INSERT INTO public.template_action VALUES (220, 10, NULL, 'joinUserOrg', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"user_id": {"children": ["applicationData.userId"], "operator": "objectProperties"}, "user_role": "Owner", "organisation_id": {"children": ["outputCumulative.organisation.id"], "operator": "objectProperties"}}', 'Example: action to connect user to organisation when application outcome is APPROVED', 102);
INSERT INTO public.template_action VALUES (221, 10, NULL, 'grantPermissions', NULL, 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"orgName": {"children": ["outputCumulative.organisation.name"], "operator": "objectProperties"}, "username": {"children": ["applicationData.username"], "operator": "objectProperties"}, "permissionNames": ["reviewJoinOrg"]}', 'Example: action to grant permissions to user when logged in with organisation joined when application outcome is APPROVED', 103);
INSERT INTO public.template_action VALUES (222, 9, NULL, 'changeOutcome', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}, {"children": [{"children": ["applicationData.stage"], "operator": "objectProperties"}, "Screening"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{"newOutcome": {"value": "REJECTED"}}', 'Change outcome to REJECT in case of NON_CONFORM decision in first stage of Screening. The next stage Assessment can also change the outcome to APPROVED/REJECTED', 57);
INSERT INTO public.template_action VALUES (223, 9, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your company licence has been registered.\n\nHi %1 %2, \n\nYour application %3 to register a licence to apply for Product registrations for company ‘%4’ has been approved. \n\nLog into your mFlow account to view the changes. \n\nMany thanks, \n\n{Regulatory Authority}", {"children": ["applicationData.firstName", ""], "operator": "objectProperties"}, {"children": ["applicationData.lastName", ""], "operator": "objectProperties"}, {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.orgName", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Congratulations, application %1 has been approved", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "fromName": "Application Manager", "fromEmail": "no-reply@sussol.net"}', 'Send notification about Demo application to user''s email when outcome is APPROVED', 58);
INSERT INTO public.template_action VALUES (224, 9, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "REJECTED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your application has been rejected\n \n%1 application was rejected during stage of %2.\nThe outline reason for rejection is:\n    \"%3\"\n\nTo see more information on mFlow visit %4/application/%5\n\nMany thanks,\n\n%6", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.stage", null], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}, {"children": ["query getRegAuth {organisation(id: 1) {name}}", "graphQLEndpoint", [], "organisation.name"], "operator": "graphQL"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Demo application to user''s email when the outcome is REJECTED', 59);
INSERT INTO public.template_action VALUES (226, 9, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# A List of Questions have been submitted\n \nApplication %1 needs your attention now. \n\n%2\n\nTo see and make changes to your application on mFlow visit: [%3/application/%4](%3/application/%4)\n\nMany thanks,\n\n%5", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, null], "operator": "!="}, {"children": ["The outline reason for changes required is:\n\n    \"%2\"", {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, ""], "operator": "?"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}, {"children": ["query getRegAuth {organisation(id: 1) {name}}", "graphQLEndpoint", [], "organisation.name"], "operator": "graphQL"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Demo application to user''s email when reviewer has submitted a List of Questions', 60);
INSERT INTO public.template_action VALUES (227, 10, NULL, 'changeOutcome', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.decision"], "operator": "objectProperties"}, "NON_CONFORM"], "operator": "="}, {"children": [{"children": ["applicationData.stage"], "operator": "objectProperties"}, "Screening"], "operator": "="}, {"children": ["applicationData.reviewData.isLastLevel"], "operator": "objectProperties"}], "operator": "AND"}', '{"newOutcome": {"value": "REJECTED"}}', 'Example action - Change outcome to REJECT in case of NON_CONFORM decision in first stage of Screening. ', 104);
INSERT INTO public.template_action VALUES (228, 10, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your company licence has been registered.\n\nHi %1 %2, \n\nYour application %3 to register a licence to apply for Product registrations for company ‘%4’ has been approved. \n\nLog into your mFlow account to view the changes. \n\nMany thanks, \n\n{Regulatory Authority}", {"children": ["applicationData.firstName", ""], "operator": "objectProperties"}, {"children": ["applicationData.lastName", ""], "operator": "objectProperties"}, {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.orgName", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Congratulations, application %1 has been approved", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Core-action application to user''s email when outcome is APPROVED', 105);
INSERT INTO public.template_action VALUES (229, 10, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "REJECTED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your application has been rejected\n \n%1 application was rejected during stage of %2.\nThe outline reason for rejection is:\n    \"%3\"\n\nTo see more information on mFlow visit [%4/application/%5](%4/application/%5)\n\nMany thanks,\n\n%6", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.stage", null], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}, {"children": ["query getRegAuth {organisation(id: 1) {name}}", "graphQLEndpoint", [], "organisation.name"], "operator": "graphQL"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Demo application to user''s email when the outcome is REJECTED', 106);
INSERT INTO public.template_action VALUES (249, 12, NULL, 'grantPermissions', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"orgName": {"children": ["", {"children": ["applicationData.responses.org.selection.name", null], "operator": "objectProperties"}], "operator": "+"}, "username": {"children": ["", {"children": ["applicationData.responses.user.selection.username"], "operator": "objectProperties"}], "operator": "+"}, "permissionNames": {"children": ["applicationData.responses.permissions.selectedValuesArray.text"], "operator": "objectProperties"}}', '', 5);
INSERT INTO public.template_action VALUES (230, 10, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# A List of Questions have been submitted\n \nApplication %1 needs your attention now. \n\n%2\n\nTo see and make changes to your application on mFlow visit: [%3/application/%4](%3/application/%4)\n\nMany thanks,\n\n%5", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, null], "operator": "!="}, {"children": ["The outline reason for changes required is:\n\n    \"%2\"", {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, ""], "operator": "?"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}, {"children": ["query getRegAuth {organisation(id: 1) {name}}", "graphQLEndpoint", [], "organisation.name"], "operator": "graphQL"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Demo application to user''s email when reviewer has submitted a List of Questions', 107);
INSERT INTO public.template_action VALUES (231, 8, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your request to join organistion has been approved.\n\nHi %1 %2, \n\nYour application %3 to join company ‘%4’ has been approved. \n\nLog into your mFlow account to view the changes. \n\nMany thanks, \n\n{Regulatory Agency}", {"children": ["applicationData.firstName", ""], "operator": "objectProperties"}, {"children": ["applicationData.lastName", ""], "operator": "objectProperties"}, {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.orgName", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Congratulations, application %1 has been approved", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "fromName": "Application Manager", "fromEmail": "no-reply@sussol.net"}', 'Send notification about Joining organisation to user''s email when outcome is APPROVED', 131);
INSERT INTO public.template_action VALUES (232, 8, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "REJECTED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your application has been rejected\n \n%1 application was rejected during stage of %2.\nThe outline reason for rejection is:\n    \"%3\"\n\nTo see more information on mFlow visit [%4/application/%5](%4/application/%5)\n\nMany thanks,\n\n{Regulatory Agency}", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.stage", null], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Demo application to user''s email when the outcome is REJECTED', 132);
INSERT INTO public.template_action VALUES (233, 8, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# A List of Questions have been submitted\n \nApplication %1 needs your attention now. \n\n%2\n\nTo see and make changes to your application on mFlow visit: [%3/application/%4](%3/application/%4)\n\nMany thanks,\n\n{Regulatory Agency}", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, null], "operator": "!="}, {"children": ["The outline reason for changes required is:\n\n    \"%2\"", {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, ""], "operator": "?"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about Demo application to user''s email when reviewer has submitted a List of Questions', 133);
INSERT INTO public.template_action VALUES (234, 7, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "APPROVED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your request to register an organistion has been approved.\n\nHi %1 %2, \n\nYour application %3 to join company ‘%4’ has been approved. \n\nLog into your mFlow account to view the changes. \n\nMany thanks, \n\n{Regulatory Agency}", {"children": ["applicationData.firstName", ""], "operator": "objectProperties"}, {"children": ["applicationData.lastName", ""], "operator": "objectProperties"}, {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.responses.name.text", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Congratulations, application %1 has been approved", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "fromName": "Application Manager", "fromEmail": "no-reply@sussol.net"}', 'Send notification about Create an organisation to user''s email when outcome is APPROVED', 104);
INSERT INTO public.template_action VALUES (235, 7, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.outcome"], "operator": "objectProperties"}, "REJECTED"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# Your application has been rejected\n \n%1 application was rejected during stage of %2.\nThe outline reason for rejection is:\n    \"%3\"\n\nTo see more information on mFlow visit [%4/application/%5](%4/application/%5)\n\nMany thanks,\n\n{Regulatory Agency}", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": ["applicationData.stage", null], "operator": "objectProperties"}, {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about create an organisation application to user''s email when the outcome is REJECTED', 105);
INSERT INTO public.template_action VALUES (236, 7, NULL, 'sendNotification', '', 'ON_REVIEW_SUBMIT', '{"children": [{"children": ["applicationData.reviewData.latestDecision.decision", null], "operator": "objectProperties"}, "LIST_OF_QUESTIONS"], "operator": "="}', '{"email": {"children": ["applicationData.email", ""], "operator": "objectProperties"}, "message": {"children": ["# A List of Questions have been submitted\n \nApplication %1 needs your attention now. \n\n%2\n\nTo see and make changes to your application on mFlow visit: [%3/application/%4](%3/application/%4)\n\nMany thanks,\n\n{Regulatory Agency}", {"children": ["applicationData.applicationName", null], "operator": "objectProperties"}, {"children": [{"children": [{"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}, null], "operator": "!="}, {"children": ["The outline reason for changes required is:\n\n    \"%2\"", {"children": ["applicationData.reviewData.latestDecision.comment", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, ""], "operator": "?"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": {"children": ["Changes have been made to your application %1", {"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Send notification about create an organisation application to user''s email when reviewer has submitted a List of Questions', 106);
INSERT INTO public.template_action VALUES (237, 11, NULL, 'generateTextString', '', 'ON_APPLICATION_CREATE', 'true', '{"pattern": "[A-Za-z0-9]{24}", "fieldName": "serial", "tableName": "application", "updateRecord": true}', 'Generate long random string for serial to make url unpredictable', 1);
INSERT INTO public.template_action VALUES (238, 11, NULL, 'generateTextString', '', 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <+dddd>", "fieldName": "name", "tableName": "application", "counterInit": 100, "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "customFields": {"counter": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', 'Create application name', 2);
INSERT INTO public.template_action VALUES (239, 11, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 1);
INSERT INTO public.template_action VALUES (240, 11, NULL, 'changeStatus', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newStatus": "SUBMITTED"}', NULL, 1);
INSERT INTO public.template_action VALUES (241, 11, NULL, 'createVerification', '', 'ON_APPLICATION_SUBMIT', '{"children": [1, {"children": ["applicationData.stageNumber", null], "operator": "objectProperties"}], "operator": "="}', '{"expiry": 1, "message": {"children": ["## Verification successful\n\n[Click here](/application/%1/id/Page1/?sessionId=%2) to change your password", {"children": [{"children": ["applicationData.applicationSerial", null], "operator": "objectProperties"}], "operator": "+"}, {"children": ["applicationData.sessionId", null], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'Create verification so that user can confirm their identity via email link', 2);
INSERT INTO public.template_action VALUES (242, 11, NULL, 'sendNotification', '', 'ON_APPLICATION_SUBMIT', '{"children": [1, {"children": ["applicationData.stageNumber", null], "operator": "objectProperties"}], "operator": "="}', '{"email": {"children": ["query getUser($username:String!) {userByUsername(username: $username) {email, firstName, lastName }}", "graphQLendpoint", ["username"], {"children": ["applicationData.responses.username.text"], "operator": "objectProperties"}, "userByUsername.email"], "operator": "graphQL"}, "message": {"children": ["Hi %1,\n\nsomeone with your username (%2) requested to reset your password. If this wasn''t you, or this was unintentional, please disregard this email.\n\nIn order to reset your password, please click (or copy-paste) the following link:\n\n[%3/verify?uid=%4](%3/verify?uid=%4)", {"children": ["query getUser($username:String!) {userByUsername(username: $username) {email, firstName, lastName }}", "graphQLendpoint", ["username"], {"children": ["applicationData.responses.username.text"], "operator": "objectProperties"}, "userByUsername.firstName"], "operator": "graphQL"}, {"children": ["applicationData.responses.username.text", null], "operator": "objectProperties"}, {"children": ["applicationData.environmentData.webHostUrl", null], "operator": "objectProperties"}, {"children": ["outputCumulative.verification.unique_id"], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "subject": "Application Manager -- password reset verification", "fromName": "Application Manager", "fromEmail": "no-reply@sussol.net"}', 'Send verification email', 3);
INSERT INTO public.template_action VALUES (243, 11, NULL, 'modifyRecord', '', 'ON_APPLICATION_SUBMIT', '{"children": [2, {"children": ["applicationData.stageNumber", null], "operator": "objectProperties"}], "operator": "="}', '{"tableName": "user", "matchField": "username", "matchValue": {"children": ["applicationData.responses.username.text", null], "operator": "objectProperties"}, "password_hash": {"children": ["applicationData.responses.password.hash"], "operator": "objectProperties"}}', 'Once verified, change password hash in database', 4);
INSERT INTO public.template_action VALUES (244, 11, NULL, 'changeOutcome', '', 'ON_APPLICATION_SUBMIT', '{"children": [2, {"children": ["applicationData.stageNumber", null], "operator": "objectProperties"}], "operator": "="}', '{"newOutcome": {"value": "APPROVED"}}', 'We''re done', 5);
INSERT INTO public.template_action VALUES (245, 11, NULL, 'incrementStage', '', 'ON_VERIFICATION', 'true', '{}', 'Increments stage so user can change password', 1);
INSERT INTO public.template_action VALUES (246, 11, NULL, 'changeStatus', '', 'ON_VERIFICATION', 'true', '{"newStatus": "DRAFT"}', 'Set to "Changes Request" so can be edited again, this time with password field active', 2);
INSERT INTO public.template_action VALUES (247, 12, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 4);
INSERT INTO public.template_action VALUES (248, 12, NULL, 'changeOutcome', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newOutcome": {"value": "APPROVED"}}', '', 3);
INSERT INTO public.template_action VALUES (250, 12, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "P-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "updateRecord": true}', '**CORE-ACTION** Generate serial for application when created', 2);
INSERT INTO public.template_action VALUES (251, 12, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', '**CORE-ACTION** Generate name for application when created', 3);
INSERT INTO public.template_action VALUES (252, 13, NULL, 'incrementStage', NULL, 'ON_APPLICATION_CREATE', 'true', NULL, NULL, 4);
INSERT INTO public.template_action VALUES (253, 13, NULL, 'changeOutcome', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"newOutcome": {"value": "APPROVED"}}', '', 4);
INSERT INTO public.template_action VALUES (254, 13, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "P-[A-Z]{3}-<+dddd>", "fieldName": "serial", "tableName": "application", "counterName": {"children": ["applicationData.templateCode"], "operator": "objectProperties"}, "updateRecord": true}', '**CORE-ACTION** Generate serial for application when created', 2);
INSERT INTO public.template_action VALUES (255, 13, NULL, 'generateTextString', NULL, 'ON_APPLICATION_CREATE', 'true', '{"pattern": "<?templateName> - <?serial>", "fieldName": "name", "tableName": "application", "customFields": {"serial": "applicationData.applicationSerial", "templateName": "applicationData.templateName"}, "updateRecord": true}', '**CORE-ACTION** Generate name for application when created', 3);
INSERT INTO public.template_action VALUES (256, 13, NULL, 'joinUserOrg', NULL, 'ON_APPLICATION_SUBMIT', 'true', '{"user_id": {"children": ["", {"children": ["applicationData.responses.user.selection.id", null], "operator": "objectProperties"}], "operator": "+"}, "organisation_id": {"children": ["applicationData.responses.org.selection.id", null], "operator": "objectProperties"}}', 'Adds user to organisation', 3);
INSERT INTO public.template_action VALUES (257, 11, NULL, 'generateTextString', '', 'ON_APPLICATION_SUBMIT', 'true', '{"pattern": "<?templateName>: <?username> - <?applicationSerial>", "fieldName": "name", "tableName": "application", "customFields": {"username": "applicationData.responses.username.text", "templateName": "applicationData.templateName", "applicationSerial": "applicationData.applicationSerial"}, "updateRecord": true}', 'Update application name with a more meaningful title using pattern:
"templateName: username - serial"', 6);
INSERT INTO public.template_action VALUES (258, 1, NULL, 'generateTextString', '', 'ON_APPLICATION_SUBMIT', 'true', '{"pattern": "<?templateName>: <?username> - <?applicationSerial>", "fieldName": "name", "tableName": "application", "customFields": {"username": "applicationData.username", "templateName": "applicationData.templateName", "applicationSerial": "applicationData.applicationSerial"}, "updateRecord": true}', 'Update application name with a more meaningful title using pattern:
"templateName: username - serial"', 4);
INSERT INTO public.template_action VALUES (259, 2, NULL, 'generateTextString', '', 'ON_APPLICATION_SUBMIT', 'true', '{"pattern": "<?templateName>: <?username> - <?applicationSerial>", "fieldName": "name", "tableName": "application", "customFields": {"username": "applicationData.responses.Q3Username.text", "templateName": "applicationData.templateName", "applicationSerial": "applicationData.applicationSerial"}, "updateRecord": true}', 'Update application name with a more meaningful title using pattern:
"templateName: username - serial"', 4);
INSERT INTO public.template_action VALUES (260, 7, NULL, 'changeStatus', '', 'ON_REVIEW_UNASSIGN', 'true', '{"isReview": true, "reviewId": {"children": ["applicationData.reviewData.reviewId", null], "operator": "objectProperties"}, "newStatus": "DISCONTINUED"}', '**CORE-ACTION** On Re-assignment happens change previous review status to DISCONTINUED', 2);
INSERT INTO public.template_action VALUES (261, 8, NULL, 'changeStatus', '', 'ON_REVIEW_UNASSIGN', 'true', '{"isReview": true, "reviewId": {"children": ["applicationData.reviewData.reviewId", null], "operator": "objectProperties"}, "newStatus": "DISCONTINUED"}', '**CORE-ACTION** On Re-assignment happens change previous review status to DISCONTINUED', 2);
INSERT INTO public.template_action VALUES (262, 9, NULL, 'changeStatus', '', 'ON_REVIEW_UNASSIGN', 'true', '{"isReview": true, "reviewId": {"children": ["applicationData.reviewData.reviewId", null], "operator": "objectProperties"}, "newStatus": "DISCONTINUED"}', '**CORE-ACTION** On Re-assignment happens change previous review status to DISCONTINUED', 2);
INSERT INTO public.template_action VALUES (263, 10, NULL, 'changeStatus', '', 'ON_REVIEW_UNASSIGN', '{"children": [{"children": [{"children": ["applicationData.reviewData.reviewId", null], "operator": "objectProperties"}, null], "operator": "objectProperties"}, null], "operator": "!="}', '{"isReview": true, "reviewId": {"children": ["applicationData.reviewData.reviewId", null], "operator": "objectProperties"}, "newStatus": "DISCONTINUED"}', '**CORE-ACTION** On Re-assignment happens change previous review status to DISCONTINUED', 2);


--
-- Data for Name: template_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_category VALUES (1, 'dev', 'Dev', 'code', '{DASHBOARD,LIST}');
INSERT INTO public.template_category VALUES (2, 'org', 'Organisation', 'building', '{DASHBOARD,LIST}');
INSERT INTO public.template_category VALUES (3, 'drugRego', 'Drug Registration', 'pills', '{DASHBOARD,LIST}');
INSERT INTO public.template_category VALUES (4, 'user', 'User settings', 'user', '{LIST,USER}');
INSERT INTO public.template_category VALUES (5, 'license', 'Company license', 'certificate', '{DASHBOARD,LIST}');
INSERT INTO public.template_category VALUES (6, 'admin', 'Admin', 'configure', '{ADMIN}');
INSERT INTO public.template_category VALUES (7, 'manage', 'System Management', 'setting', '{MANAGEMENT}');


--
-- Data for Name: template_element; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_element VALUES (1, 1, 'Text1', 0, 'Intro', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": "Please update your user information"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (2, 1, 'Q1', 1, 'First Name', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, {"value": ".+"}], "operator": "REGEX"}', '{"operator": "buildObject", "properties": [{"key": "text", "value": {"children": ["currentUser.firstName"], "operator": "objectProperties"}}]}', 'First name must not be blank', NULL, '{"label": "First Name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (3, 1, 'Q2', 2, 'Last Name', 'QUESTION', 'shortText', 'true', 'true', 'true', 'true', '{"operator": "buildObject", "properties": [{"key": "text", "value": {"children": ["currentUser.lastName"], "operator": "objectProperties"}}]}', NULL, NULL, '{"label": "Last Name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (4, 1, 'Q3', 3, 'Username', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "+"}, ["type", "value"], "username", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "API"}, {"children": [{"children": ["currentUser.username"], "operator": "objectProperties"}, {"children": ["responses.thisResponse"], "operator": "objectProperties"}], "operator": "="}], "operator": "OR"}', '{"operator": "buildObject", "properties": [{"key": "text", "value": {"children": ["currentUser.username"], "operator": "objectProperties"}}]}', 'Username must be unique', '', '{"label": "Select a username"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (5, 1, 'Q4', 4, 'Email', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, "^\\S+@\\S+\\.\\S+$"], "operator": "REGEX"}', '{"operator": "buildObject", "properties": [{"key": "text", "value": {"children": ["currentUser.email"], "operator": "objectProperties"}}]}', 'Not a valid email address', '', '{"label": "Email"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (6, 1, 'passwordCheckbox', 5, 'Password Change Check', 'QUESTION', 'checkbox', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"type": "toggle", "label": "Do you wish to change your password?", "checkboxes": ["Yes"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (7, 1, 'currentPassword', 6, 'Current Password', 'QUESTION', 'password', '{"children": [{"children": ["responses.passwordCheckbox.values.0.selected"], "operator": "objectProperties"}, true], "operator": "="}', 'true', 'true', 'true', NULL, '', 'To change your password, you must first enter your current password correctly.', '{"label": "Current Password", "placeholder": "Current password", "validationInternal": {"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/public/login"], "operator": "+"}, ["username", "password"], {"children": ["currentUser.username"], "operator": "objectProperties"}, {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "success"], "operator": "POST"}, "requireConfirmation": false, "validationMessageInternal": "Incorrect password"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (8, 1, 'newPassword', 7, 'New Password', 'QUESTION', 'password', '{"children": [{"children": ["responses.currentPassword.isValid", false], "operator": "objectProperties"}, true], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "New Password", "description": "Please select a new password", "placeholder": "Password must be at least 8 chars long", "validationInternal": {"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, {"value": "^[\\S]{8,}$"}], "operator": "REGEX"}, "validationMessageInternal": "Password must be at least 8 characters"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (9, 2, 'S1Page1', 10, 'Intro Section 1', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"style": "basic", "title": "## Welcome to IRIMS Application Manager"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (10, 2, 'Q1FirstName', 20, 'First Name', 'QUESTION', 'shortText', 'true', 'true', 'true', 'true', NULL, NULL, '### User Registration

Please provide accurate details to **register** for a user account on our system.', '{"label": "First Name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (11, 2, 'Q2LastName', 30, 'Last Name', 'QUESTION', 'shortText', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Last Name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (12, 2, 'Q3Username', 40, 'Username', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "+"}, ["type", "value"], "username", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "API"}, {"children": [{"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, "^[a-zA-Z0-9_.-@]{3,50}$"], "operator": "REGEX"}, true], "operator": "="}], "operator": "AND"}', NULL, 'Username already in use or invalid', NULL, '{"label": "Select a username", "description": "You can use 3 or more letters, numbers and - . _ or @"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (13, 2, 'Q4Email', 50, 'Email', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, "^\\S+@\\S+\\.\\S+$"], "operator": "REGEX"}', NULL, 'Not a valid email address', '', '{"label": "Email"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (14, 2, 'Q5Password', 60, 'Password', 'QUESTION', 'password', 'true', 'true', 'true', 'true', NULL, '', '', '{"label": "Password", "maskedInput": true, "placeholder": "Password must be at least 6 chars long", "validationInternal": {"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, {"value": "^[\\S]{6,}$"}], "operator": "REGEX"}, "validationMessageInternal": "Password must be at least 6 characters"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (94, 11, 'S1T1', 10, 'Intro Section 1', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"style": "info", "title": "## Organisation details"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (95, 11, 'name', 20, 'Organisation Name', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "CONCAT"}, ["type", "value"], "organisation", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "API"}', NULL, 'An organisation with that name already exists', NULL, '{"label": "What is the name of your organisation?"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (138, 14, 'D1', 25, 'API Selection demo', 'QUESTION', 'dropdownChoice', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "API Lookup: Choose a name from this list", "search": true, "options": {"children": [{"value": "https://jsonplaceholder.typicode.com/users"}, {"value": []}, {"value": "name"}], "operator": "API"}, "placeholder": "Select"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (96, 11, 'rego', 30, 'Registration', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "CONCAT"}, ["table", "field", "value"], "organisation", "registration", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "API"}', NULL, 'An organisation with that registration code already exists', 'The details entered here should match with the documents issued by the governing body in your jurisdiction. You will attach evidence of these documents in the following section.', '{"label": "Please enter your organisation registration code"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (97, 11, 'physAdd', 40, 'Address', 'QUESTION', 'longText', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Organisation **physical** address"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (98, 11, 'addressCheckbox', 50, 'Postal Address Checkbox', 'QUESTION', 'checkbox', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Is the organisation **postal** address *different* to the physical address?", "checkboxes": [{"key": "1", "label": "Yes", "selected": false}]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (99, 11, 'postAdd', 60, 'Address', 'QUESTION', 'longText', '{"children": [{"children": ["responses.addressCheckbox.text"], "operator": "objectProperties"}, "Yes"], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Organisation **postal** address", "description": "*Note: in the current schema only one address value is actually saved to the database. This is just for demonstration purposes.*"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (100, 11, 'PB1', 70, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (101, 11, 'logo', 80, 'Logo upload', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Upload a logo for your organisation", "description": "File must be an image type (.jpg, .jpeg, .png, .gif, .svg) and less than 5MB", "fileSizeLimit": 5000, "fileCountLimit": 1, "fileExtensions": ["jpg", "jpeg", "png", "gif", "svg"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (102, 11, 'activity', 90, 'Organisation Activity', 'QUESTION', 'dropdownChoice', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "What is your organisation''s primary activity", "options": ["Manufacturer", "Importer", "Producer"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (103, 12, 'orgInfo', 10, 'Intro Section 2 - Page 1/2', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": {"children": ["Registration no. **%1**", {"children": ["responses.rego.text"], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "style": "basic", "title": {"children": ["**Documentation for Organisation: %1**", {"children": ["responses.name.text"], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (104, 12, 'logoShow', 20, 'Show uploaded logo', 'INFORMATION', 'imageDisplay', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"url": {"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, {"children": ["responses.logo.files.fileUrl"], "operator": "objectProperties"}], "operator": "CONCAT"}, "size": "tiny", "altText": "Organisation logo", "alignment": "center"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (105, 12, 'regoDoc', 30, 'Registration upload', 'QUESTION', 'fileUpload', 'true', 'true', 'true', 'true', NULL, NULL, 'Certification from your country''s registration body is required.', '{"label": "Please provide proof of your organisation registration", "description": "Allowed formats: .pdf, .doc, .jpg, .png", "fileSizeLimit": 5000, "fileCountLimit": 1, "fileExtensions": ["jpg", "jpeg", "png", "pdf", "doc", "docx"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (106, 12, 'otherDoc', 40, 'Other documentation upload', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, 'Examples might include import permits.', '{"label": "Please provide any other documentation pertinent to your organisation''s activities", "description": "Allowed formats: .pdf, .doc, .jpg, .png", "fileSizeLimit": 5000, "fileExtensions": ["jpg", "jpeg", "png", "pdf", "doc", "docx"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (107, 13, 'S1T1', 0, 'Intro Section 1', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"style": "basic", "title": {"children": ["### Welcome, **%1**.", {"children": ["applicationData.user.firstName"], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (108, 13, 'S1Q1', 1, 'Select Organisation', 'QUESTION', 'dropdownChoice', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Please select the organisation you wish to join", "search": true, "options": {"children": ["query getOrgs {organisations {nodes {name, id}}}", "", [], "organisations.nodes"], "operator": "graphQL"}, "optionsDisplayProperty": "name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (109, 13, 'S1Q2', 2, 'Reason', 'QUESTION', 'longText', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Reason for joining", "description": "Please provide a brief summary of your relationship to this organisation"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (110, 13, 'PB01', 3, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (111, 13, 'T2', 4, 'Documentation Info', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"style": "basic", "title": "### Documentation"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (112, 13, 'IDUpload', 5, 'Upload ID', 'QUESTION', 'fileUpload', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Please provide photo ID", "description": "Please upload a copy of your photo ID. Must be in **image** or **PDF** format and under 5MB.", "fileSizeLimit": 5000, "fileCountLimit": 1, "fileExtensions": ["pdf", "png", "jpg", "jpeg"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (113, 13, 'DocUpload', 6, 'Upload Doc', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Please upload additional documentation", "description": "If necessary, please provide additional documentation showing your relationship to this organisation.\nYou can upload more than one file if necessary, with same restrictions as above.", "fileSizeLimit": 5000, "fileCountLimit": 5, "fileExtensions": ["pdf", "png", "jpg", "jpeg"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (114, 14, 'Q1', 0, 'First Name', 'QUESTION', 'shortText', 'true', 'true', 'true', 'true', NULL, NULL, 'Markdown text can be added to questions with tips to users about important **details**', '{"label": "First Name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (115, 14, 'Q2', 1, 'Last Name', 'QUESTION', 'shortText', 'true', 'false', 'true', '{"children": [{"children": [{"children": ["responses.Q1.text"], "operator": "objectProperties"}, {"value": null}], "operator": "!="}, {"children": [{"children": ["responses.Q1.text"], "operator": "objectProperties"}, {"value": ""}], "operator": "!="}], "operator": "AND"}', NULL, 'You need a first name.', NULL, '{"label": {"children": ["%1, what is your last name?", {"children": ["responses.Q1.text", ""], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (139, 14, 'D2', 26, 'Test Visibility', 'QUESTION', 'shortText', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Enter ''magicword'' to see a text box"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (116, 14, 'Text1', 2, 'User Info', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": {"children": ["The new user''s name is: %1 %2", {"children": ["responses.Q1.text", ""], "operator": "objectProperties"}, {"children": ["responses.Q2.text", ""], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "style": "basic", "title": {"children": ["**Current User: %1 %2**", {"children": ["applicationData.user.firstName"], "operator": "objectProperties"}, {"children": ["applicationData.user.lastName", ""], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (117, 14, 'Q3', 3, 'LongText Demo', 'QUESTION', 'longText', 'true', 'false', 'true', '{"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, "^[\\s\\S]{0,100}$"], "operator": "REGEX"}', NULL, 'Response must be less than 100 characters', 'Try entering more than 100 characters to see validation message!', '{"label": "Description", "lines": 8, "maxLength": 101, "placeholder": "Enter here..."}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (118, 14, 'Q4', 4, 'Password', 'QUESTION', 'password', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Password", "placeholder": "Password must be at least 8 chars long", "confirmPlaceholder": "Enter password again", "validationInternal": {"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, {"value": "^[\\S]{8,}$"}], "operator": "REGEX"}, "validationMessageInternal": "Password must be at least 8 characters"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (119, 14, 'PB1', 5, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (120, 14, 'Text2', 6, 'Page2', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": "Shows other selectors as a result of your **selection** which can be **dynamically defined**", "title": "### This page demonstrates selectors options"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (121, 14, 'Q5', 7, 'Organisation Category', 'QUESTION', 'radioChoice', 'true', 'false', 'true', 'true', NULL, NULL, 'Next displayed specific dropdown showing based on selection to pick one specific from a static list', '{"label": "Organisation Type", "options": ["Manufacturer", "Distributor", "Importer"], "validation": {"value": true}, "description": "_Select which type of organisation you belong to._"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (122, 14, 'Q6', 8, 'Select Manufacturer', 'QUESTION', 'dropdownChoice', '{"children": [{"children": ["responses.Q5.text"], "operator": "objectProperties"}, {"value": "Manufacturer"}], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Select Manufacturer", "options": ["Manufacturer A", "Manufacturer B", "Manufacturer C"], "placeholder": "Select"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (123, 14, 'Q7', 9, 'Select Distributor', 'QUESTION', 'dropdownChoice', '{"children": [{"children": ["responses.Q5.text"], "operator": "objectProperties"}, {"value": "Distributor"}], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Select Distributor", "options": ["Distributor A", "Distributor B", "Distributor C"], "placeholder": "Select"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (124, 14, 'Q8', 10, 'Select Importer', 'QUESTION', 'dropdownChoice', '{"children": [{"children": ["responses.Q5.text"], "operator": "objectProperties"}, {"value": "Importer"}], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Select Importer", "options": ["Importer A", "Importer B", "Importer C"], "placeholder": "Select"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (125, 14, 'PB3', 12, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (126, 14, 'Q10', 13, 'Testing Radio buttons', 'QUESTION', 'radioChoice', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "This Radio button group has no default", "options": ["Option A", "Option B", "Option C"], "hasOther": true, "otherPlaceholder": "Enter other answer"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (127, 14, 'Q11', 14, 'GraphQL query', 'QUESTION', 'dropdownChoice', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Select an organisation (GraphQL query)", "options": {"children": ["query getOrgs {organisations {nodes {name}}}", "graphQLEndpoint", [], "organisations.nodes"], "operator": "graphQL"}, "placeholder": "Select one"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (128, 14, 'PB4', 15, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (129, 14, 'CheckboxShowcase', 16, 'Checkbox demonstration', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": "Different types and settings for Checkbox plugin", "style": "basic", "title": "## Checkbox demonstration"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (130, 14, 'CB1', 17, 'Single checkbox', 'QUESTION', 'checkbox', 'true', 'false', 'true', 'true', NULL, NULL, '', '{"label": "This is a single checkbox", "checkboxes": ["Tick me"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (131, 14, 'CB2', 18, 'Three checkboxes', 'QUESTION', 'checkbox', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Three checkboxes, one pre-selected", "checkboxes": [{"key": 0, "label": "Option 1", "selected": true}, "Option 2", "Option 3"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (132, 14, 'CB3', 19, 'Toggle switch', 'QUESTION', 'checkbox', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"type": "toggle", "label": "Behold! a **toggle** switch:", "checkboxes": ["ON"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (133, 14, 'TXTON-OFF', 20, 'Checkbox ON', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"title": {"children": ["The switch is toggled %1", {"children": [{"children": [{"children": ["responses.CB3.text"], "operator": "objectProperties"}, "ON"], "operator": "="}, "ON", "OFF"], "operator": "?"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (134, 14, 'CB4', 21, 'Slider switch', 'QUESTION', 'checkbox', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"type": "slider", "label": "And a couple of **sliders**:", "checkboxes": [{"key": "Opt1", "text": "Ice-cream", "label": "I like ice-cream"}, {"key": "Opt2", "text": "Cake", "label": "I like cake"}], "displayFormat": "checkboxes"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (135, 14, 'TXT_LIKE', 22, 'Display Likes', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": {"children": ["You like: %1%2", {"children": [{"children": ["responses.CB4.values.Opt1.selected"], "operator": "objectProperties"}, "\n- Ice Cream", ""], "operator": "?"}, {"children": [{"children": ["responses.CB4.values.Opt2.selected"], "operator": "objectProperties"}, "\n- Cake", ""], "operator": "?"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (136, 14, 'CB5', 23, 'Many checkboxes', 'QUESTION', 'checkbox', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Lotsa boxes", "layout": "inline", "checkboxes": {"children": [{"value": "https://jsonplaceholder.typicode.com/users"}, {"value": []}, {"value": "name"}], "operator": "API"}, "description": "If you have a lot of checkboxes, you may wish to use `layout: \"inline\"`.  \n_This selection is dynamically created from an online API._", "displayFormat": "checkboxes"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (137, 14, 'PB5', 24, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (140, 14, 'Text3', 27, 'Intro', 'INFORMATION', 'textInfo', '{"children": [{"children": ["responses.D2.text"], "operator": "objectProperties"}, {"value": "magicword"}], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": {"children": ["You chose %1 (index number %2) in the API lookup", {"children": ["responses.D1.text"], "operator": "objectProperties"}, {"children": ["responses.D1.optionIndex"], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "style": "success", "title": "This has appeared because you typed \"magicword\" above."}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (141, 14, 'Text4', 28, 'Text Showcase', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": "A text info box can be presented in a number of **styles**.\n\n*Please select one below*", "style": {"children": ["responses.D3.text"], "operator": "objectProperties"}, "title": "## Many ways to deliver information!"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (142, 14, 'D3', 29, 'Selector for TextInfo showcase', 'QUESTION', 'dropdownChoice', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Select a style", "default": "none", "options": ["none", "basic", "info", "warning", "success", "positive", "error", "negative"], "placeholder": "Select"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (143, 15, 'DocText1', 100, 'Document Intro', 'INFORMATION', 'textInfo', 'true', 'false', 'true', 'true', NULL, NULL, 'This section provides a demonstration of the different ways the file upload element can be used', '{"text": "A demonstration of the File Upload plugin", "style": "info", "title": "### This sections allows you to upload files"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (144, 15, 'Q_upload1', 101, 'File upload demo 1', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Please upload your documentation", "description": "You can provide multiple files.  \nFiles must be **image** files or **PDF** and under 5MB.", "fileSizeLimit": 5000, "fileCountLimit": 6, "fileExtensions": ["pdf", "png", "jpg"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (145, 15, 'PB6', 102, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (146, 15, 'Q_upload2', 103, 'File upload demo 2', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Please add some more files", "description": {"children": ["No restrictions on this one, but we''re testing dynamic description:\n\n_The files uploaded in the last page were:_  \n- _%1_", {"children": ["responses.Q_upload1.text", "No files uploaded"], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "fileCountLimit": 99}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (147, 15, 'PB7', 104, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (148, 15, 'Q_upload3', 105, 'File image upload', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Please upload an image file to display", "description": "Only 1 file allowed, must be an image type (.jpg, .jpeg, .png, .gif, .svg) and less than 5MB", "fileSizeLimit": 5000, "fileCountLimit": 1, "fileExtensions": ["jpg", "jpeg", "png", "gif", "svg"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (149, 15, 'Img01', 106, 'Show uploaded image', 'INFORMATION', 'imageDisplay', '{"children": [{"children": ["responses.Q_upload3.text"], "operator": "objectProperties"}, ""], "operator": "!="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"url": {"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, {"children": ["responses.Q_upload3.files.fileUrl"], "operator": "objectProperties"}], "operator": "CONCAT"}, "size": {"children": ["responses.ImgOpt1.text"], "operator": "objectProperties"}, "altText": "This is the image you uploaded", "alignment": {"children": ["responses.ImgOpt2.text"], "operator": "objectProperties"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (150, 15, 'ImgOpt1', 107, 'Image size control', 'QUESTION', 'dropdownChoice', '{"children": [{"children": ["responses.Q_upload3.text"], "operator": "objectProperties"}, ""], "operator": "!="}', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Select image size", "default": 3, "options": ["mini", "tiny", "small", "medium", "large", "big", "huge", "massive"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (151, 15, 'ImgOpt2', 108, 'Image alignment control', 'QUESTION', 'dropdownChoice', '{"children": [{"children": ["responses.Q_upload3.text"], "operator": "objectProperties"}, ""], "operator": "!="}', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Select image alignment", "default": 1, "options": ["left", "center", "right"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (152, 16, 'IngredientsHeader', 3, 'Ingredients list demonstration', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, 'Add items one by one to create an **Ingredients list**', '{"text": "List items can be displayed in **Card** or **Table** form", "style": "info", "title": "## Ingredients list demonstration"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (153, 16, 'listDemo', 4, 'Ingredients List Demo', 'QUESTION', 'listBuilder', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Ingredients list", "modalText": "## Ingredient item \n\nPlease enter details for **one** ingredient", "displayType": {"children": ["responses.listDisplay.text"], "operator": "objectProperties"}, "inputFields": [{"code": "LB1", "title": "Substance Name", "isRequired": true, "parameters": {"label": "Substance name"}, "elementTypePluginCode": "shortText"}, {"code": "LB2", "title": "Complementary information", "isRequired": false, "parameters": {"label": "Complementary information"}, "elementTypePluginCode": "shortText"}, {"code": "LB3", "title": "Quantity", "parameters": {"label": "Quantity", "maxWidth": 130, "description": "Enter a number and select units below"}, "validation": {"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, "^[0-9.]+$"], "operator": "REGEX"}, "validationMessage": "Must be a number", "elementTypePluginCode": "shortText"}, {"code": "LB4", "title": "Unit", "parameters": {"label": "Unit", "options": ["Milligram", "Microgram", "International Unit"], "hasOther": true}, "elementTypePluginCode": "radioChoice"}, {"code": "LB5", "title": "Type", "parameters": {"label": "Type", "default": 0, "options": ["Active", "Inactive"]}, "elementTypePluginCode": "dropdownChoice"}, {"code": "LB6", "title": "Included", "parameters": {"label": "Substance present in end product", "layout": "inline", "options": ["Yes", "No"]}, "elementTypePluginCode": "radioChoice"}], "displayFormat": {"title": "${LB1}", "subtitle": "${LB2}", "description": "**Quantity**: ${LB4} ${LB5}  \n**Substance present?**: ${LB3}  \n**Type**: ${LB6}"}, "createModalButtonText": "Add ingredient"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (154, 16, 'listDisplay', 5, 'List Display Selector', 'QUESTION', 'dropdownChoice', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Display style for Ingredients list", "default": "cards", "options": ["cards", "table"], "placeholder": "Select"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (155, 16, 'PB14', 6, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (156, 16, 'searchUsers', 7, 'Search Demo (users)', 'QUESTION', 'search', 'true', 'false', 'true', 'true', NULL, NULL, 'This page contain examples of the **Search** element. It can make API queries in response to user input and display the results, which can be selected.', '{"icon": "user", "label": "Search for users", "source": {"children": ["query GetUsers($user: String!) { users(filter: { username: {includesInsensitive: $user } }) {nodes { username, firstName, lastName }}}", "graphQLEndpoint", ["user"], {"children": ["search.text"], "operator": "objectProperties"}, "users.nodes"], "operator": "graphQL"}, "description": "Start typing to search database for usernames", "placeholder": "Search usernames", "displayFormat": {"title": "${firstName} ${lastName}", "description": "${username}"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (157, 16, 'searchCountries', 8, 'Search Demo (countries)', 'QUESTION', 'search', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"icon": "world", "label": "Search for countries", "source": {"children": ["query countries($code: ID!) {country(code: $code) {name, capital, emoji, code}}", "https://countries.trevorblades.com", ["code"], {"children": ["search.text"], "operator": "objectProperties"}, "country"], "operator": "graphQL"}, "description": "Type the two-character country code (must be CAPS sorry)", "multiSelect": true, "placeholder": "Search countries", "displayFormat": {"title": "${emoji} ${name}", "description": "Capital: ${capital}"}, "minCharacters": 2}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (158, 16, 'searchUC', 9, 'Search Universal Codes', 'QUESTION', 'search', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"icon": "pills", "label": "Lookup mSupply Universal Codes", "source": {"children": ["query GetEntitiesByName($search: String!) {entities (filter: { code: \"\" description: $search type: \"[drug]\" match: \"contains\"},offset: 0,first: 25) {data {        code,     description,        type,        uid  }, totalLength }}", "https://codes.msupply.foundation:2048/graphql", ["search"], {"children": ["search.text"], "operator": "objectProperties"}, "entities.data"], "operator": "graphQL"}, "description": "Start typing a drug name", "multiSelect": true, "placeholder": "Search medicines", "resultFormat": {"title": "${description}", "description": "${code}"}, "displayFormat": {"title": "${description}", "description": "Universal Code: ${code}"}, "minCharacters": 3}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (159, 16, 'searchOrg', 11, 'Search Demo (organisations)', 'QUESTION', 'search', 'true', 'false', 'true', 'true', NULL, NULL, 'This one has no `displayFormat` prop, so it falls back to a generic "default" display', '{"icon": "building", "label": "Search for an organisation", "source": {"children": ["query GetOrgs($registration: String!) { organisations(filter: {registration: {startsWithInsensitive: $registration}}) { nodes { name registration } } }", "graphQLEndpoint", ["registration"], {"children": ["search.text"], "operator": "objectProperties"}, "organisations.nodes"], "operator": "graphQL"}, "description": "Please enter the organisation''s registration code (min 6 chars)", "placeholder": "Search organisations", "minCharacters": 6}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (160, 17, 'S1T1', 10, 'Intro Section 1', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, '', '', '{"style": "basic", "title": "## Organisation details"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (161, 17, 'name', 20, 'Organisation Name', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "CONCAT"}, ["type", "value"], "organisation", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "API"}', NULL, 'An organisation with that name already exists', NULL, '{"label": "What is the name of your organisation?"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (162, 17, 'rego', 30, 'Registration', 'QUESTION', 'shortText', 'true', 'true', 'true', '{"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "CONCAT"}, ["table", "field", "value"], "organisation", "registration", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "API"}', NULL, 'An organisation with that registration code already exists', 'The details entered here should match with the documents issued by the governing body in your jurisdiction. You will attach evidence of these documents in the following section.', '{"label": "Please enter your organisation registration code"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (163, 17, 'physAdd', 40, 'Address', 'QUESTION', 'longText', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Organisation **physical** address"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (164, 17, 'addressCheckbox', 50, 'Postal Address Checkbox', 'QUESTION', 'checkbox', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Is the organisation **postal** address *different* to the physical address?", "checkboxes": [{"key": "1", "label": "Yes", "selected": false}]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (165, 17, 'postAdd', 60, 'Address', 'QUESTION', 'longText', '{"children": [{"children": ["responses.addressCheckbox.text"], "operator": "objectProperties"}, "Yes"], "operator": "="}', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "Organisation **postal** address", "description": "*Note: in the current schema only one address value is actually saved to the database. This is just for demonstration purposes.*"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (166, 17, 'PB1', 70, 'Page Break', 'INFORMATION', 'pageBreak', 'true', 'true', 'true', 'true', NULL, NULL, NULL, NULL, 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (167, 17, 'logo', 80, 'Logo upload', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, NULL, '{"label": "Upload a logo for your organisation", "description": "File must be an image type (.jpg, .jpeg, .png, .gif, .svg) and less than 5MB", "fileSizeLimit": 5000, "fileCountLimit": 1, "fileExtensions": ["jpg", "jpeg", "png", "gif", "svg"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (168, 17, 'activity', 90, 'Organisation Activity', 'QUESTION', 'dropdownChoice', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"label": "What is your organisation''s primary activity", "options": ["Manufacturer", "Importer", "Producer"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (169, 18, 'orgInfo', 10, 'Intro Section 2 - Page 1/2', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"text": {"children": ["Registration no. **%1**", {"children": ["responses.rego.text"], "operator": "objectProperties"}], "operator": "stringSubstitution"}, "style": "basic", "title": {"children": ["**Documentation for Organisation: %1**", {"children": ["responses.name.text"], "operator": "objectProperties"}], "operator": "stringSubstitution"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (170, 18, 'logoShow', 20, 'Show uploaded logo', 'INFORMATION', 'imageDisplay', 'true', 'true', 'true', 'true', NULL, NULL, NULL, '{"url": {"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, {"children": ["responses.logo.files.fileUrl"], "operator": "objectProperties"}], "operator": "CONCAT"}, "size": "tiny", "altText": "Organisation logo", "alignment": "center"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (171, 18, 'regoDoc', 30, 'Registration upload', 'QUESTION', 'fileUpload', 'true', 'true', 'true', 'true', NULL, NULL, 'Certification from your country''s registration body is required.', '{"label": "Please provide proof of your organisation registration", "description": "Allowed formats: .pdf, .doc, .jpg, .png", "fileSizeLimit": 5000, "fileCountLimit": 1, "fileExtensions": ["jpg", "jpeg", "png", "pdf", "doc", "docx"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (172, 18, 'otherDoc', 40, 'Other documentation upload', 'QUESTION', 'fileUpload', 'true', 'false', 'true', 'true', NULL, NULL, 'Examples might include import permits.', '{"label": "Please provide any other documentation pertinent to your organisation''s activities", "description": "Allowed formats: .pdf, .doc, .jpg, .png", "fileSizeLimit": 5000, "fileExtensions": ["jpg", "jpeg", "png", "pdf", "doc", "docx"]}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (173, 19, 'infoHeader', 10, 'Intro Section 1', 'INFORMATION', 'textInfo', 'true', 'true', 'true', 'true', NULL, '', '', '{"style": "success", "title": "### Password reset request"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (174, 19, 'username', 40, 'Username', 'QUESTION', 'shortText', 'true', 'true', '{"children": [1, {"children": ["applicationData.current.stage.number", null], "operator": "objectProperties"}], "operator": "="}', '{"children": [false, {"children": [{"children": [{"children": ["applicationData.config.serverREST"], "operator": "objectProperties"}, "/check-unique"], "operator": "+"}, ["type", "caseInsensitive", "value"], "username", "false", {"children": ["responses.thisResponse"], "operator": "objectProperties"}, "unique"], "operator": "GET"}], "operator": "="}', NULL, 'Sorry, this username is not recognised. Ensure capitalisation of username is correct.', NULL, '{"label": "Please enter your username"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (175, 19, 'password', 41, 'New Element', 'QUESTION', 'password', '{"children": [2, {"children": ["applicationData.current.stage.number", null], "operator": "objectProperties"}], "operator": "="}', 'true', 'true', 'true', NULL, '', '', '{"label": "New password", "maskedInput": true, "placeholder": "Password must be at least 6 chars long", "validationInternal": {"children": [{"children": ["responses.thisResponse"], "operator": "objectProperties"}, {"value": "^[\\S]{6,}$"}], "operator": "REGEX"}, "validationMessageInternal": "Password must be at least 6 characters"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (176, 20, 'user', 1, 'user', 'QUESTION', 'search', 'true', 'true', 'true', 'true', NULL, '', '', '{"icon": "user", "label": "User", "source": {"children": ["query findUser($search: String!) {\n  users(\n    filter: {\n      or: [\n        { email: { includesInsensitive: $search } }\n        { firstName: { includesInsensitive: $search } }\n        { lastName: { includesInsensitive: $search } }\n        { username: { includesInsensitive: $search } }\n      ]\n    }\n  ) {\n    nodes {\n      email\n      firstName\n      lastName\n      username\n      id\n    }\n  }\n}\n", "graphQLEndpoint", ["search"], {"children": ["search.text"], "operator": "objectProperties"}, "users.nodes"], "operator": "graphQL"}, "multiSelect": false, "placeholder": "Search for User", "resultFormat": {"title": "${username}", "description": "First Name: ${firstName} \nLast Name:${lastName} \nemail:${email}"}, "displayFormat": {"title": "${username}", "description": "First Name: ${firstName} \nLast Name:${lastName} \nemail:${email}"}, "minCharacters": 3}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (177, 20, 'permissions', 3, 'permissions', 'QUESTION', 'checkbox', 'true', 'true', 'true', 'true', NULL, '', '', '{"label": "Permissions", "checkboxes": {"children": ["query getPermissionNames {\n  permissionNames {\n    nodes {\n      name\n    }\n  }\n}", "graphQLEndpoint", [], "permissionNames.nodes.name"], "operator": "graphQL"}}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (178, 20, 'org', 2, 'Organisation', 'QUESTION', 'search', 'true', 'false', 'true', 'true', NULL, '', '', '{"icon": "building", "label": "Organisation", "source": {"children": ["query findOrg($search: String!) {\n  organisations(filter: { name: { includesInsensitive: $search } }) {\n    nodes {\n      name\n      id\n    }\n  }\n}\n", "graphQLEndpoint", ["search"], {"children": ["search.text"], "operator": "objectProperties"}, "organisations.nodes"], "operator": "graphQL"}, "multiSelect": false, "placeholder": "Search for Organisation", "resultFormat": {"Company": "${name}"}, "displayFormat": {"title": "${name}"}, "minCharacters": 3}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (179, 21, 'user', 1, 'user', 'QUESTION', 'search', 'true', 'true', 'true', 'true', NULL, '', '', '{"icon": "user", "label": "User", "source": {"children": ["query findUser($search: String!) {\n  users(\n    filter: {\n      or: [\n        { email: { includesInsensitive: $search } }\n        { firstName: { includesInsensitive: $search } }\n        { lastName: { includesInsensitive: $search } }\n        { username: { includesInsensitive: $search } }\n      ]\n    }\n  ) {\n    nodes {\n      email\n      firstName\n      lastName\n      username\n      id\n    }\n  }\n}\n", "graphQLEndpoint", ["search"], {"children": ["search.text"], "operator": "objectProperties"}, "users.nodes"], "operator": "graphQL"}, "multiSelect": false, "placeholder": "Search for User", "resultFormat": {"title": "${username}", "description": "First Name: ${firstName} \nLast Name:${lastName} \nemail:${email}"}, "displayFormat": {"title": "${username}", "description": "First Name: ${firstName} \nLast Name:${lastName} \nemail:${email}"}, "minCharacters": 3}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);
INSERT INTO public.template_element VALUES (180, 21, 'org', 2, 'Organisation Select', 'QUESTION', 'dropdownChoice', 'true', 'true', 'true', 'true', '""', '', '', '{"label": "Select an organisation to add user to", "search": true, "options": {"children": ["query GetOrgs {\n  organisations {\n    nodes {\n      id\n      name\n    }\n  }\n}\n", "graphQLEndpoint", [], "organisations.nodes"], "operator": "graphQL"}, "optionsDisplayProperty": "name"}', 'ONLY_IF_APPLICANT_ANSWER', DEFAULT, DEFAULT);


--
-- Data for Name: template_filter_join; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_filter_join VALUES (45, 7, 1);
INSERT INTO public.template_filter_join VALUES (46, 7, 2);
INSERT INTO public.template_filter_join VALUES (47, 7, 3);
INSERT INTO public.template_filter_join VALUES (48, 7, 4);
INSERT INTO public.template_filter_join VALUES (49, 7, 5);
INSERT INTO public.template_filter_join VALUES (50, 7, 6);
INSERT INTO public.template_filter_join VALUES (51, 7, 7);
INSERT INTO public.template_filter_join VALUES (52, 7, 8);
INSERT INTO public.template_filter_join VALUES (53, 7, 9);
INSERT INTO public.template_filter_join VALUES (54, 7, 10);
INSERT INTO public.template_filter_join VALUES (55, 7, 11);
INSERT INTO public.template_filter_join VALUES (56, 8, 1);
INSERT INTO public.template_filter_join VALUES (57, 8, 2);
INSERT INTO public.template_filter_join VALUES (58, 8, 3);
INSERT INTO public.template_filter_join VALUES (59, 8, 4);
INSERT INTO public.template_filter_join VALUES (60, 8, 5);
INSERT INTO public.template_filter_join VALUES (61, 8, 6);
INSERT INTO public.template_filter_join VALUES (62, 8, 7);
INSERT INTO public.template_filter_join VALUES (63, 8, 8);
INSERT INTO public.template_filter_join VALUES (64, 8, 9);
INSERT INTO public.template_filter_join VALUES (65, 8, 10);
INSERT INTO public.template_filter_join VALUES (66, 8, 11);
INSERT INTO public.template_filter_join VALUES (67, 9, 1);
INSERT INTO public.template_filter_join VALUES (68, 9, 2);
INSERT INTO public.template_filter_join VALUES (69, 9, 3);
INSERT INTO public.template_filter_join VALUES (70, 9, 4);
INSERT INTO public.template_filter_join VALUES (71, 9, 5);
INSERT INTO public.template_filter_join VALUES (72, 9, 6);
INSERT INTO public.template_filter_join VALUES (73, 9, 7);
INSERT INTO public.template_filter_join VALUES (74, 9, 8);
INSERT INTO public.template_filter_join VALUES (75, 9, 9);
INSERT INTO public.template_filter_join VALUES (76, 9, 10);
INSERT INTO public.template_filter_join VALUES (77, 9, 11);
INSERT INTO public.template_filter_join VALUES (78, 10, 1);
INSERT INTO public.template_filter_join VALUES (79, 10, 2);
INSERT INTO public.template_filter_join VALUES (80, 10, 3);
INSERT INTO public.template_filter_join VALUES (81, 10, 4);
INSERT INTO public.template_filter_join VALUES (82, 10, 5);
INSERT INTO public.template_filter_join VALUES (83, 10, 6);
INSERT INTO public.template_filter_join VALUES (84, 10, 7);
INSERT INTO public.template_filter_join VALUES (85, 10, 8);
INSERT INTO public.template_filter_join VALUES (86, 10, 9);
INSERT INTO public.template_filter_join VALUES (87, 10, 10);
INSERT INTO public.template_filter_join VALUES (88, 10, 11);


--
-- Data for Name: template_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_permission VALUES (1, 4, 1, NULL, false, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (2, 2, 2, NULL, false, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (20, 4, 7, NULL, false, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (21, 5, 7, NULL, true, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (22, 7, 7, NULL, false, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (23, 4, 8, NULL, false, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (24, 7, 8, NULL, false, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (25, 6, 8, NULL, true, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (26, 4, 9, NULL, false, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (27, 9, 9, NULL, true, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (29, 8, 9, NULL, false, false, 2, 1, NULL);
INSERT INTO public.template_permission VALUES (30, 12, 9, NULL, true, false, 2, 2, NULL);
INSERT INTO public.template_permission VALUES (31, 13, 9, NULL, false, true, 3, 1, NULL);
INSERT INTO public.template_permission VALUES (32, 7, 9, NULL, false, false, 2, 1, NULL);
INSERT INTO public.template_permission VALUES (33, 4, 10, NULL, false, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (34, 7, 10, NULL, false, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (35, 8, 10, NULL, true, false, 1, 1, NULL);
INSERT INTO public.template_permission VALUES (36, 14, 11, NULL, true, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (39, 15, 13, NULL, true, false, NULL, NULL, NULL);
INSERT INTO public.template_permission VALUES (40, 15, 12, NULL, true, false, NULL, NULL, NULL);


--
-- Data for Name: template_section; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_section VALUES (1, 1, 'User information', 'S1', 0);
INSERT INTO public.template_section VALUES (2, 2, 'Basic user information', 'S1', 0);
INSERT INTO public.template_section VALUES (11, 7, 'Section 1: Organisation Details', 'S1', 0);
INSERT INTO public.template_section VALUES (12, 7, 'Section 2: Documentation', 'S2', 1);
INSERT INTO public.template_section VALUES (13, 8, 'Personal Information', 'S1', 0);
INSERT INTO public.template_section VALUES (14, 9, 'Section 1 - Basics', 'S1', 0);
INSERT INTO public.template_section VALUES (15, 9, 'Section 2 - File Upload', 'S2', 2);
INSERT INTO public.template_section VALUES (16, 9, 'Section 3 - Lists & Search', 'S3', 3);
INSERT INTO public.template_section VALUES (17, 10, 'Section 1: Organisation Details', 'S1', 0);
INSERT INTO public.template_section VALUES (18, 10, 'Section 2: Documentation', 'S2', 1);
INSERT INTO public.template_section VALUES (19, 11, 'Identify User', 'id', 0);
INSERT INTO public.template_section VALUES (20, 12, 'Grant Permissions', 'S1', 0);
INSERT INTO public.template_section VALUES (21, 13, 'Add User', 'S1', 0);


--
-- Data for Name: template_stage; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_stage VALUES (1, 1, 'Automatic', NULL, '#24B5DF', 1);
INSERT INTO public.template_stage VALUES (2, 1, 'Automatic', NULL, '#1E14DB', 2);
INSERT INTO public.template_stage VALUES (9, 1, 'Approval', 'This application will be approved by a Reviewer', '#1E14DB', 7);
INSERT INTO public.template_stage VALUES (10, 1, 'Approval', 'This application will be approved by a Reviewer', '#1E14DB', 8);
INSERT INTO public.template_stage VALUES (11, 1, 'Screening', 'This application will go through the Screening stage before it can be accessed.', '#24B5DF', 9);
INSERT INTO public.template_stage VALUES (12, 2, 'Assessment', 'This phase is where your documents will be revised before the application can get the final approval.', '#E17E48', 9);
INSERT INTO public.template_stage VALUES (13, 3, 'Final Decision', 'This is the final step and will change the outcome of this applications.', '#1E14DB', 9);
INSERT INTO public.template_stage VALUES (14, 1, 'Approval', 'This application will be approved by a Reviewer', '#1E14DB', 10);
INSERT INTO public.template_stage VALUES (15, 1, 'Check Username', 'User enters username', '#1E14DB', 11);
INSERT INTO public.template_stage VALUES (16, 2, 'Change Password', 'User can change password once verified', '#24B5DF', 11);
INSERT INTO public.template_stage VALUES (17, 1, 'Automatic', NULL, '#1E14DB', 12);
INSERT INTO public.template_stage VALUES (18, 1, 'Automatic', '', '#1E14DB', 13);


--
-- Data for Name: template_stage_review_level; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.template_stage_review_level VALUES (8, 9, 1, 'Review', NULL);
INSERT INTO public.template_stage_review_level VALUES (9, 10, 1, 'Review', NULL);
INSERT INTO public.template_stage_review_level VALUES (10, 11, 1, 'Review', NULL);
INSERT INTO public.template_stage_review_level VALUES (11, 12, 1, 'Review', NULL);
INSERT INTO public.template_stage_review_level VALUES (12, 12, 2, 'Consolidation', NULL);
INSERT INTO public.template_stage_review_level VALUES (13, 13, 1, 'Approval', NULL);
INSERT INTO public.template_stage_review_level VALUES (14, 14, 1, 'Review', NULL);


--
-- Data for Name: trigger_queue; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trigger_schedule; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."user" VALUES (1, NULL, NULL, DEFAULT, 'nonRegistered', '', NULL, '$2a$10$UIfa3GTUbOS92Ygy/UpqheTngGo3O54Q5UOnJ5CBlra9LYCcr4IGq');
INSERT INTO public."user" VALUES (2, 'Admin', 'Admin', DEFAULT, 'admin', NULL, NULL, '$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW.');
INSERT INTO public."user" VALUES (3, 'System', 'Manager', DEFAULT, 'manager', NULL, NULL, '$2a$10$5R5ruFOLgrjOox5oH0I67.Rez7qGCEwf2a60Pe2TpfmIN99Dr0uW.');


--
-- Data for Name: user_organisation; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_organisation VALUES (2, 2, 1, 'Owner');
INSERT INTO public.user_organisation VALUES (3, 3, 1, NULL);


--
-- Data for Name: verification; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: action_plugin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_plugin_id_seq', 23, true);


--
-- Name: action_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_queue_id_seq', 1, true);


--
-- Name: activity_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_log_id_seq', 3, true);


--
-- Name: application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_id_seq', 19, true);


--
-- Name: application_note_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_note_id_seq', 1, true);


--
-- Name: application_response_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_response_id_seq', 212, true);


--
-- Name: application_stage_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_stage_history_id_seq', 18, true);


--
-- Name: application_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_status_history_id_seq', 18, true);


--
-- Name: counter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.counter_id_seq', 9, true);


--
-- Name: data_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.data_table_id_seq', 1, true);


--
-- Name: data_view_column_definition_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.data_view_column_definition_id_seq', 19, true);


--
-- Name: data_view_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.data_view_id_seq', 4, true);


--
-- Name: file_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_id_seq', 5, true);


--
-- Name: filter_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.filter_id_seq', 11, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_id_seq', 1, true);


--
-- Name: organisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.organisation_id_seq', 1, true);


--
-- Name: permission_join_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_join_id_seq', 15, true);


--
-- Name: permission_name_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_name_id_seq', 15, true);


--
-- Name: permission_policy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_policy_id_seq', 8, true);


--
-- Name: review_assignment_assigner_join_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_assignment_assigner_join_id_seq', 1, true);


--
-- Name: review_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_assignment_id_seq', 1, true);


--
-- Name: review_decision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_decision_id_seq', 1, true);


--
-- Name: review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_id_seq', 1, true);


--
-- Name: review_response_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_response_id_seq', 1, true);


--
-- Name: review_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.review_status_history_id_seq', 1, true);


--
-- Name: system_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_info_id_seq', 27, true);


--
-- Name: template_action_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_action_id_seq', 279, true);


--
-- Name: template_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_category_id_seq', 7, true);


--
-- Name: template_element_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_element_id_seq', 180, true);


--
-- Name: template_filter_join_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_filter_join_id_seq', 88, true);


--
-- Name: template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_id_seq', 13, true);


--
-- Name: template_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_permission_id_seq', 40, true);


--
-- Name: template_section_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_section_id_seq', 21, true);


--
-- Name: template_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_stage_id_seq', 18, true);


--
-- Name: template_stage_review_level_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.template_stage_review_level_id_seq', 14, true);


--
-- Name: trigger_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trigger_queue_id_seq', 1, true);


--
-- Name: trigger_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trigger_schedule_id_seq', 1, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_id_seq', 3, true);


--
-- Name: user_organisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_organisation_id_seq', 3, true);


--
-- Name: verification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.verification_id_seq', 1, true);


--
-- Name: action_plugin action_plugin_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_plugin
    ADD CONSTRAINT action_plugin_code_key UNIQUE (code);


--
-- Name: action_plugin action_plugin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_plugin
    ADD CONSTRAINT action_plugin_pkey PRIMARY KEY (id);


--
-- Name: action_queue action_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_queue
    ADD CONSTRAINT action_queue_pkey PRIMARY KEY (id);


--
-- Name: activity_log activity_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_pkey PRIMARY KEY (id);


--
-- Name: application_note application_note_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_note
    ADD CONSTRAINT application_note_pkey PRIMARY KEY (id);


--
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (id);


--
-- Name: application_response application_response_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_response
    ADD CONSTRAINT application_response_pkey PRIMARY KEY (id);


--
-- Name: application application_serial_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_serial_key UNIQUE (serial);


--
-- Name: application_stage_history application_stage_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_stage_history
    ADD CONSTRAINT application_stage_history_pkey PRIMARY KEY (id);


--
-- Name: application_status_history application_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_pkey PRIMARY KEY (id);


--
-- Name: counter counter_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter
    ADD CONSTRAINT counter_name_key UNIQUE (name);


--
-- Name: counter counter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter
    ADD CONSTRAINT counter_pkey PRIMARY KEY (id);


--
-- Name: data_table data_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT data_table_pkey PRIMARY KEY (id);


--
-- Name: data_table data_table_table_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT data_table_table_name_key UNIQUE (table_name);


--
-- Name: data_view_column_definition data_view_column_definition_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_view_column_definition
    ADD CONSTRAINT data_view_column_definition_pkey PRIMARY KEY (id);


--
-- Name: data_view_column_definition data_view_column_definition_table_name_column_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_view_column_definition
    ADD CONSTRAINT data_view_column_definition_table_name_column_name_key UNIQUE (table_name, column_name);


--
-- Name: data_view data_view_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.data_view
    ADD CONSTRAINT data_view_pkey PRIMARY KEY (id);


--
-- Name: element_type_plugin element_type_plugin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.element_type_plugin
    ADD CONSTRAINT element_type_plugin_pkey PRIMARY KEY (code);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (id);


--
-- Name: file file_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_unique_id_key UNIQUE (unique_id);


--
-- Name: filter filter_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter
    ADD CONSTRAINT filter_code_key UNIQUE (code);


--
-- Name: filter filter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.filter
    ADD CONSTRAINT filter_pkey PRIMARY KEY (id);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);


--
-- Name: organisation organisation_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_name_key UNIQUE (name);


--
-- Name: organisation organisation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_pkey PRIMARY KEY (id);


--
-- Name: organisation organisation_registration_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organisation
    ADD CONSTRAINT organisation_registration_key UNIQUE (registration);


--
-- Name: permission_join permission_join_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_join
    ADD CONSTRAINT permission_join_pkey PRIMARY KEY (id);


--
-- Name: permission_name permission_name_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_name
    ADD CONSTRAINT permission_name_name_key UNIQUE (name);


--
-- Name: permission_name permission_name_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_name
    ADD CONSTRAINT permission_name_pkey PRIMARY KEY (id);


--
-- Name: permission_policy permission_policy_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_policy
    ADD CONSTRAINT permission_policy_name_key UNIQUE (name);


--
-- Name: permission_policy permission_policy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_policy
    ADD CONSTRAINT permission_policy_pkey PRIMARY KEY (id);


--
-- Name: review_assignment_assigner_join review_assignment_assigner_join_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment_assigner_join
    ADD CONSTRAINT review_assignment_assigner_join_pkey PRIMARY KEY (id);


--
-- Name: review_assignment review_assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_pkey PRIMARY KEY (id);


--
-- Name: review_decision review_decision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision
    ADD CONSTRAINT review_decision_pkey PRIMARY KEY (id);


--
-- Name: review review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_pkey PRIMARY KEY (id);


--
-- Name: review_response review_response_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response
    ADD CONSTRAINT review_response_pkey PRIMARY KEY (id);


--
-- Name: review_status_history review_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_status_history
    ADD CONSTRAINT review_status_history_pkey PRIMARY KEY (id);


--
-- Name: system_info system_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_info
    ADD CONSTRAINT system_info_pkey PRIMARY KEY (id);


--
-- Name: template_action template_action_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_action
    ADD CONSTRAINT template_action_pkey PRIMARY KEY (id);


--
-- Name: template_category template_category_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_category
    ADD CONSTRAINT template_category_code_key UNIQUE (code);


--
-- Name: template_category template_category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_category
    ADD CONSTRAINT template_category_pkey PRIMARY KEY (id);


--
-- Name: template_element template_element_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_element
    ADD CONSTRAINT template_element_pkey PRIMARY KEY (id);


--
-- Name: template_element template_element_template_code_code_template_version_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_element
    ADD CONSTRAINT template_element_template_code_code_template_version_key UNIQUE (template_code, code, template_version);


--
-- Name: template_filter_join template_filter_join_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_filter_join
    ADD CONSTRAINT template_filter_join_pkey PRIMARY KEY (id);


--
-- Name: template_permission template_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_permission
    ADD CONSTRAINT template_permission_pkey PRIMARY KEY (id);


--
-- Name: template template_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template
    ADD CONSTRAINT template_pkey PRIMARY KEY (id);


--
-- Name: template_section template_section_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_section
    ADD CONSTRAINT template_section_pkey PRIMARY KEY (id);


--
-- Name: template_section template_section_template_id_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_section
    ADD CONSTRAINT template_section_template_id_code_key UNIQUE (template_id, code);


--
-- Name: template_stage template_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_stage
    ADD CONSTRAINT template_stage_pkey PRIMARY KEY (id);


--
-- Name: template_stage_review_level template_stage_review_level_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_stage_review_level
    ADD CONSTRAINT template_stage_review_level_pkey PRIMARY KEY (id);


--
-- Name: trigger_queue trigger_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_queue
    ADD CONSTRAINT trigger_queue_pkey PRIMARY KEY (id);


--
-- Name: trigger_schedule trigger_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_schedule
    ADD CONSTRAINT trigger_schedule_pkey PRIMARY KEY (id);


--
-- Name: user_organisation user_organisation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organisation
    ADD CONSTRAINT user_organisation_pkey PRIMARY KEY (id);


--
-- Name: user_organisation user_organisation_user_id_organisation_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organisation
    ADD CONSTRAINT user_organisation_user_id_organisation_id_key UNIQUE (user_id, organisation_id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: verification verification_unique_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_unique_id_key UNIQUE (unique_id);


--
-- Name: activity_log_application_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX activity_log_application_index ON public.activity_log USING btree (application_id);


--
-- Name: i_action_queue_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_action_queue_template_id_fkey ON public.action_queue USING btree (template_id);


--
-- Name: i_action_queue_trigger_event_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_action_queue_trigger_event_fkey ON public.action_queue USING btree (trigger_event);


--
-- Name: i_application_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_is_active ON public.application USING btree (is_active);


--
-- Name: i_application_is_config; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_is_config ON public.application USING btree (is_config);


--
-- Name: i_application_note_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_note_application_id_fkey ON public.application_note USING btree (application_id);


--
-- Name: i_application_note_org_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_note_org_id_fkey ON public.application_note USING btree (org_id);


--
-- Name: i_application_note_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_note_user_id_fkey ON public.application_note USING btree (user_id);


--
-- Name: i_application_org_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_org_id_fkey ON public.application USING btree (org_id);


--
-- Name: i_application_outcome; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_outcome ON public.application USING btree (outcome);


--
-- Name: i_application_response_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_response_application_id_fkey ON public.application_response USING btree (application_id);


--
-- Name: i_application_response_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_response_status ON public.application_response USING btree (status);


--
-- Name: i_application_response_template_element_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_response_template_element_id_fkey ON public.application_response USING btree (template_element_id);


--
-- Name: i_application_response_value_is_not_null; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_response_value_is_not_null ON public.application_response USING btree (((value IS NOT NULL)));


--
-- Name: i_application_response_value_is_null; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_response_value_is_null ON public.application_response USING btree (((value IS NULL)));


--
-- Name: i_application_stage_history_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_stage_history_application_id_fkey ON public.application_stage_history USING btree (application_id);


--
-- Name: i_application_stage_history_is_current; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_stage_history_is_current ON public.application_stage_history USING btree (is_current);


--
-- Name: i_application_stage_history_stage_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_stage_history_stage_id_fkey ON public.application_stage_history USING btree (stage_id);


--
-- Name: i_application_status_history_application_stage_history_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_status_history_application_stage_history_id_fkey ON public.application_status_history USING btree (application_stage_history_id);


--
-- Name: i_application_status_history_is_current; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_status_history_is_current ON public.application_status_history USING btree (is_current);


--
-- Name: i_application_status_history_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_status_history_status ON public.application_status_history USING btree (status);


--
-- Name: i_application_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_template_id_fkey ON public.application USING btree (template_id);


--
-- Name: i_application_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_application_user_id_fkey ON public.application USING btree (user_id);


--
-- Name: i_file_application_note_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_file_application_note_id_fkey ON public.file USING btree (application_note_id);


--
-- Name: i_file_application_response_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_file_application_response_id_fkey ON public.file USING btree (application_response_id);


--
-- Name: i_file_application_serial_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_file_application_serial_fkey ON public.file USING btree (application_serial);


--
-- Name: i_file_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_file_template_id_fkey ON public.file USING btree (template_id);


--
-- Name: i_file_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_file_user_id_fkey ON public.file USING btree (user_id);


--
-- Name: i_notification_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_notification_application_id_fkey ON public.notification USING btree (application_id);


--
-- Name: i_notification_review_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_notification_review_id_fkey ON public.notification USING btree (review_id);


--
-- Name: i_notification_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_notification_user_id_fkey ON public.notification USING btree (user_id);


--
-- Name: i_permission_join_organisation_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_permission_join_organisation_id_fkey ON public.permission_join USING btree (organisation_id);


--
-- Name: i_permission_join_permission_name_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_permission_join_permission_name_id_fkey ON public.permission_join USING btree (permission_name_id);


--
-- Name: i_permission_join_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_permission_join_user_id_fkey ON public.permission_join USING btree (user_id);


--
-- Name: i_permission_name_permission_policy_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_permission_name_permission_policy_id_fkey ON public.permission_name USING btree (permission_policy_id);


--
-- Name: i_review_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_application_id_fkey ON public.review USING btree (application_id);


--
-- Name: i_review_assignment_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_application_id_fkey ON public.review_assignment USING btree (application_id);


--
-- Name: i_review_assignment_assigned_sections; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_assigned_sections ON public.review_assignment USING btree (assigned_sections);


--
-- Name: i_review_assignment_assigner_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_assigner_id_fkey ON public.review_assignment USING btree (assigner_id);


--
-- Name: i_review_assignment_assigner_join_assigner_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_assigner_join_assigner_id_fkey ON public.review_assignment_assigner_join USING btree (assigner_id);


--
-- Name: i_review_assignment_assigner_join_organisation_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_assigner_join_organisation_id_fkey ON public.review_assignment_assigner_join USING btree (organisation_id);


--
-- Name: i_review_assignment_assigner_join_review_assignment_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_assigner_join_review_assignment_id_fkey ON public.review_assignment_assigner_join USING btree (review_assignment_id);


--
-- Name: i_review_assignment_level_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_level_id_fkey ON public.review_assignment USING btree (level_id);


--
-- Name: i_review_assignment_level_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_level_number ON public.review_assignment USING btree (level_number);


--
-- Name: i_review_assignment_organisation_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_organisation_id_fkey ON public.review_assignment USING btree (organisation_id);


--
-- Name: i_review_assignment_reviewer_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_reviewer_id_fkey ON public.review_assignment USING btree (reviewer_id);


--
-- Name: i_review_assignment_stage_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_stage_id_fkey ON public.review_assignment USING btree (stage_id);


--
-- Name: i_review_assignment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_status ON public.review_assignment USING btree (status);


--
-- Name: i_review_assignment_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_assignment_template_id_fkey ON public.review_assignment USING btree (template_id);


--
-- Name: i_review_decision_review_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_decision_review_id_fkey ON public.review_decision USING btree (review_id);


--
-- Name: i_review_response_application_response_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_response_application_response_id_fkey ON public.review_response USING btree (application_response_id);


--
-- Name: i_review_response_original_review_response_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_response_original_review_response_id_fkey ON public.review_response USING btree (original_review_response_id);


--
-- Name: i_review_response_review_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_response_review_id_fkey ON public.review_response USING btree (review_id);


--
-- Name: i_review_response_review_response_link_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_response_review_response_link_id_fkey ON public.review_response USING btree (review_response_link_id);


--
-- Name: i_review_response_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_response_status ON public.review_response USING btree (status);


--
-- Name: i_review_response_template_element_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_response_template_element_id_fkey ON public.review_response USING btree (template_element_id);


--
-- Name: i_review_review_assignment_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_review_assignment_id_fkey ON public.review USING btree (review_assignment_id);


--
-- Name: i_review_reviewer_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_reviewer_id_fkey ON public.review USING btree (reviewer_id);


--
-- Name: i_review_status_history_review_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_review_status_history_review_id_fkey ON public.review_status_history USING btree (review_id);


--
-- Name: i_template_action_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_action_template_id_fkey ON public.template_action USING btree (template_id);


--
-- Name: i_template_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_code ON public.template USING btree (code);


--
-- Name: i_template_element_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_element_category ON public.template_element USING btree (category);


--
-- Name: i_template_element_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_element_code ON public.template_element USING btree (code);


--
-- Name: i_template_element_reviewability; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_element_reviewability ON public.template_element USING btree (reviewability);


--
-- Name: i_template_element_section_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_element_section_id_fkey ON public.template_element USING btree (section_id);


--
-- Name: i_template_element_template_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_element_template_code ON public.template_element USING btree (template_code);


--
-- Name: i_template_filter_join_filter_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_filter_join_filter_id_fkey ON public.template_filter_join USING btree (filter_id);


--
-- Name: i_template_filter_join_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_filter_join_template_id_fkey ON public.template_filter_join USING btree (template_id);


--
-- Name: i_template_permission_permission_name_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_permission_permission_name_id_fkey ON public.template_permission USING btree (permission_name_id);


--
-- Name: i_template_permission_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_permission_template_id_fkey ON public.template_permission USING btree (template_id);


--
-- Name: i_template_section_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_section_code ON public.template_section USING btree (code);


--
-- Name: i_template_stage_review_level_stage_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_stage_review_level_stage_id_fkey ON public.template_stage_review_level USING btree (stage_id);


--
-- Name: i_template_stage_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_stage_template_id_fkey ON public.template_stage USING btree (template_id);


--
-- Name: i_template_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_status ON public.template USING btree (status);


--
-- Name: i_template_template_category_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_template_template_category_id_fkey ON public.template USING btree (template_category_id);


--
-- Name: i_trigger_schedule_editor_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_trigger_schedule_editor_user_id_fkey ON public.trigger_schedule USING btree (editor_user_id);


--
-- Name: i_trigger_schedule_template_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_trigger_schedule_template_id_fkey ON public.trigger_schedule USING btree (template_id);


--
-- Name: i_user_organisation_organisation_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_user_organisation_organisation_id_fkey ON public.user_organisation USING btree (organisation_id);


--
-- Name: i_verification_application_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX i_verification_application_id_fkey ON public.verification USING btree (application_id);


--
-- Name: unique_application_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_application_event ON public.trigger_schedule USING btree (application_id, event_code);


--
-- Name: unique_org_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_org_permission ON public.permission_join USING btree (organisation_id, permission_name_id) WHERE (user_id IS NULL);


--
-- Name: unique_review_assignment_assigner_no_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_review_assignment_assigner_no_org ON public.review_assignment_assigner_join USING btree (assigner_id, review_assignment_id) WHERE (organisation_id IS NULL);


--
-- Name: unique_review_assignment_assigner_with_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_review_assignment_assigner_with_org ON public.review_assignment_assigner_join USING btree (assigner_id, organisation_id, review_assignment_id) WHERE (organisation_id IS NOT NULL);


--
-- Name: unique_review_assignment_no_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_review_assignment_no_org ON public.review_assignment USING btree (reviewer_id, stage_number, application_id, level_number) WHERE (organisation_id IS NULL);


--
-- Name: unique_review_assignment_with_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_review_assignment_with_org ON public.review_assignment USING btree (reviewer_id, organisation_id, stage_number, application_id, level_number) WHERE (organisation_id IS NOT NULL);


--
-- Name: unique_template_action_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_template_action_code ON public.template_action USING btree (code, template_id);


--
-- Name: unique_user_org_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_org_permission ON public.permission_join USING btree (user_id, organisation_id, permission_name_id) WHERE (organisation_id IS NOT NULL);


--
-- Name: unique_user_permission; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_permission ON public.permission_join USING btree (user_id, permission_name_id) WHERE (organisation_id IS NULL);


--
-- Name: action_queue action_queue; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER action_queue AFTER INSERT ON public.action_queue FOR EACH ROW WHEN ((new.status <> 'PROCESSING'::public.action_queue_status)) EXECUTE FUNCTION public.notify_action_queue();


--
-- Name: application_response application_response_timestamp_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER application_response_timestamp_trigger AFTER UPDATE OF status, value, is_valid ON public.application_response FOR EACH ROW EXECUTE FUNCTION public.update_response_timestamp();


--
-- Name: application_stage_history application_stage_history_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER application_stage_history_trigger AFTER INSERT OR UPDATE OF is_current ON public.application_stage_history FOR EACH ROW WHEN ((new.is_current = true)) EXECUTE FUNCTION public.stage_is_current_update();


--
-- Name: application_status_history application_status_history_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER application_status_history_trigger AFTER INSERT OR UPDATE OF is_current ON public.application_status_history FOR EACH ROW WHEN ((new.is_current = true)) EXECUTE FUNCTION public.status_is_current_update();


--
-- Name: application application_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER application_trigger AFTER INSERT OR UPDATE OF trigger ON public.application FOR EACH ROW WHEN (((new.trigger IS NOT NULL) AND (new.trigger <> 'PROCESSING'::public.trigger) AND (new.trigger <> 'ERROR'::public.trigger))) EXECUTE FUNCTION public.add_event_to_trigger_queue();


--
-- Name: review_assignment assignment_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER assignment_activity_trigger AFTER UPDATE ON public.review_assignment FOR EACH ROW WHEN ((new.assigned_sections <> old.assigned_sections)) EXECUTE FUNCTION public.assignment_activity_log();


--
-- Name: trigger_schedule deadline_extension_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER deadline_extension_activity_trigger AFTER UPDATE ON public.trigger_schedule FOR EACH ROW WHEN (((new.time_scheduled > old.time_scheduled) AND ((new.event_code)::text = 'applicantDeadline'::text) AND (new.editor_user_id IS NOT NULL))) EXECUTE FUNCTION public.deadline_extension_activity_log();


--
-- Name: file file_deletion; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER file_deletion AFTER DELETE ON public.file FOR EACH ROW EXECUTE FUNCTION public.notify_file_server();


--
-- Name: file file_no_longer_reference; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER file_no_longer_reference AFTER UPDATE ON public.file FOR EACH ROW WHEN (((new.is_external_reference_doc = false) AND (new.is_internal_reference_doc = false) AND ((old.is_external_reference_doc = true) OR (old.is_internal_reference_doc = true)))) EXECUTE FUNCTION public.mark_file_for_deletion();


--
-- Name: application outcome_insert_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER outcome_insert_activity_trigger AFTER INSERT ON public.application FOR EACH ROW EXECUTE FUNCTION public.outcome_activity_log();


--
-- Name: application outcome_revert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER outcome_revert_trigger AFTER UPDATE OF outcome ON public.application FOR EACH ROW WHEN (((new.outcome = 'PENDING'::public.application_outcome) AND (old.outcome <> 'PENDING'::public.application_outcome))) EXECUTE FUNCTION public.outcome_reverted();


--
-- Name: application outcome_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER outcome_trigger AFTER UPDATE OF outcome ON public.application FOR EACH ROW WHEN (((old.outcome = 'PENDING'::public.application_outcome) AND (new.outcome <> 'PENDING'::public.application_outcome))) EXECUTE FUNCTION public.outcome_changed();


--
-- Name: application outcome_update_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER outcome_update_activity_trigger AFTER UPDATE ON public.application FOR EACH ROW WHEN ((new.outcome <> old.outcome)) EXECUTE FUNCTION public.outcome_activity_log();


--
-- Name: permission_join permission_delete_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER permission_delete_activity_trigger BEFORE DELETE ON public.permission_join FOR EACH ROW EXECUTE FUNCTION public.permission_activity_log();


--
-- Name: permission_join permission_insert_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER permission_insert_activity_trigger AFTER INSERT ON public.permission_join FOR EACH ROW EXECUTE FUNCTION public.permission_activity_log();


--
-- Name: review_assignment review_assignment_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_assignment_trigger AFTER INSERT OR UPDATE OF trigger ON public.review_assignment FOR EACH ROW WHEN (((new.trigger IS NOT NULL) AND (new.trigger <> 'PROCESSING'::public.trigger) AND (new.trigger <> 'ERROR'::public.trigger))) EXECUTE FUNCTION public.add_event_to_trigger_queue();


--
-- Name: review_assignment review_assignment_validate_section_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_assignment_validate_section_trigger BEFORE UPDATE ON public.review_assignment FOR EACH ROW EXECUTE FUNCTION public.enforce_asssigned_section_validity();


--
-- Name: review_decision review_decision_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_decision_activity_trigger AFTER UPDATE ON public.review_decision FOR EACH ROW WHEN ((new.decision <> old.decision)) EXECUTE FUNCTION public.review_decision_activity_log();


--
-- Name: review_response review_response_latest; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_response_latest AFTER UPDATE OF time_updated ON public.review_response FOR EACH ROW WHEN ((new.time_updated > old.time_created)) EXECUTE FUNCTION public.set_latest_review_response();


--
-- Name: review_response review_response_timestamp_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_response_timestamp_trigger AFTER UPDATE OF comment, decision ON public.review_response FOR EACH ROW EXECUTE FUNCTION public.update_review_response_timestamp();


--
-- Name: review_status_history review_status_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_status_activity_trigger BEFORE INSERT ON public.review_status_history FOR EACH ROW EXECUTE FUNCTION public.review_status_activity_log();


--
-- Name: review_status_history review_status_history_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_status_history_trigger AFTER INSERT OR UPDATE OF is_current ON public.review_status_history FOR EACH ROW WHEN ((new.is_current = true)) EXECUTE FUNCTION public.review_status_history_is_current_update();


--
-- Name: review review_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER review_trigger AFTER INSERT OR UPDATE OF trigger ON public.review FOR EACH ROW WHEN (((new.trigger IS NOT NULL) AND (new.trigger <> 'PROCESSING'::public.trigger) AND (new.trigger <> 'ERROR'::public.trigger))) EXECUTE FUNCTION public.add_event_to_trigger_queue();


--
-- Name: review_response set_original_response_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_original_response_trigger BEFORE INSERT ON public.review_response FOR EACH ROW EXECUTE FUNCTION public.set_original_response();


--
-- Name: template set_template_to_draft_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_template_to_draft_trigger BEFORE INSERT ON public.template FOR EACH ROW EXECUTE FUNCTION public.set_template_to_draft();


--
-- Name: template set_template_version_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_template_version_trigger BEFORE INSERT OR UPDATE ON public.template FOR EACH ROW EXECUTE FUNCTION public.set_template_verision();


--
-- Name: application_stage_history stage_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER stage_activity_trigger AFTER INSERT ON public.application_stage_history FOR EACH ROW EXECUTE FUNCTION public.stage_activity_log();


--
-- Name: application_status_history status_activity_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER status_activity_trigger BEFORE INSERT ON public.application_status_history FOR EACH ROW EXECUTE FUNCTION public.status_activity_log();


--
-- Name: template template_status_update_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER template_status_update_trigger AFTER UPDATE OF status ON public.template FOR EACH ROW WHEN ((new.status = 'AVAILABLE'::public.template_status)) EXECUTE FUNCTION public.template_status_update();


--
-- Name: trigger_queue trigger_queue; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_queue AFTER INSERT ON public.trigger_queue FOR EACH ROW EXECUTE FUNCTION public.notify_trigger_queue();


--
-- Name: trigger_schedule trigger_schedule_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_schedule_trigger AFTER INSERT OR UPDATE OF trigger ON public.trigger_schedule FOR EACH ROW WHEN (((new.trigger IS NOT NULL) AND (new.trigger <> 'PROCESSING'::public.trigger) AND (new.trigger <> 'ERROR'::public.trigger))) EXECUTE FUNCTION public.add_event_to_trigger_queue();


--
-- Name: verification verification_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER verification_trigger AFTER INSERT OR UPDATE OF trigger ON public.verification FOR EACH ROW WHEN (((new.trigger IS NOT NULL) AND (new.trigger <> 'PROCESSING'::public.trigger) AND (new.trigger <> 'ERROR'::public.trigger))) EXECUTE FUNCTION public.add_event_to_trigger_queue();


--
-- Name: action_queue action_queue_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_queue
    ADD CONSTRAINT action_queue_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: action_queue action_queue_trigger_event_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_queue
    ADD CONSTRAINT action_queue_trigger_event_fkey FOREIGN KEY (trigger_event) REFERENCES public.trigger_queue(id);


--
-- Name: activity_log activity_log_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_log
    ADD CONSTRAINT activity_log_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: application_note application_note_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_note
    ADD CONSTRAINT application_note_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: application_note application_note_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_note
    ADD CONSTRAINT application_note_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organisation(id) ON DELETE CASCADE;


--
-- Name: application_note application_note_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_note
    ADD CONSTRAINT application_note_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: application application_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organisation(id) ON DELETE CASCADE;


--
-- Name: application_response application_response_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_response
    ADD CONSTRAINT application_response_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: application_response application_response_template_element_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_response
    ADD CONSTRAINT application_response_template_element_id_fkey FOREIGN KEY (template_element_id) REFERENCES public.template_element(id) ON DELETE CASCADE;


--
-- Name: application_stage_history application_stage_history_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_stage_history
    ADD CONSTRAINT application_stage_history_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: application_stage_history application_stage_history_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_stage_history
    ADD CONSTRAINT application_stage_history_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.template_stage(id) ON DELETE CASCADE;


--
-- Name: application_status_history application_status_history_application_stage_history_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_status_history
    ADD CONSTRAINT application_status_history_application_stage_history_id_fkey FOREIGN KEY (application_stage_history_id) REFERENCES public.application_stage_history(id) ON DELETE CASCADE;


--
-- Name: application application_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: application application_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: file file_application_note_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_application_note_id_fkey FOREIGN KEY (application_note_id) REFERENCES public.application_note(id) ON DELETE CASCADE;


--
-- Name: file file_application_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_application_response_id_fkey FOREIGN KEY (application_response_id) REFERENCES public.application_response(id) ON DELETE CASCADE;


--
-- Name: file file_application_serial_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_application_serial_fkey FOREIGN KEY (application_serial) REFERENCES public.application(serial) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: file file_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: file file_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: notification notification_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: notification notification_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.review(id) ON DELETE CASCADE;


--
-- Name: notification notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: permission_join permission_join_organisation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_join
    ADD CONSTRAINT permission_join_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisation(id) ON DELETE CASCADE;


--
-- Name: permission_join permission_join_permission_name_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_join
    ADD CONSTRAINT permission_join_permission_name_id_fkey FOREIGN KEY (permission_name_id) REFERENCES public.permission_name(id) ON DELETE CASCADE;


--
-- Name: permission_join permission_join_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_join
    ADD CONSTRAINT permission_join_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: permission_name permission_name_permission_policy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission_name
    ADD CONSTRAINT permission_name_permission_policy_id_fkey FOREIGN KEY (permission_policy_id) REFERENCES public.permission_policy(id);


--
-- Name: review review_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_assigner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_assigner_id_fkey FOREIGN KEY (assigner_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: review_assignment_assigner_join review_assignment_assigner_join_assigner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment_assigner_join
    ADD CONSTRAINT review_assignment_assigner_join_assigner_id_fkey FOREIGN KEY (assigner_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: review_assignment_assigner_join review_assignment_assigner_join_organisation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment_assigner_join
    ADD CONSTRAINT review_assignment_assigner_join_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisation(id) ON DELETE CASCADE;


--
-- Name: review_assignment_assigner_join review_assignment_assigner_join_review_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment_assigner_join
    ADD CONSTRAINT review_assignment_assigner_join_review_assignment_id_fkey FOREIGN KEY (review_assignment_id) REFERENCES public.review_assignment(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.template_stage_review_level(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_organisation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisation(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.template_stage(id) ON DELETE CASCADE;


--
-- Name: review_assignment review_assignment_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_assignment
    ADD CONSTRAINT review_assignment_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: review_decision review_decision_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_decision
    ADD CONSTRAINT review_decision_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.review(id) ON DELETE CASCADE;


--
-- Name: review_response review_response_application_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response
    ADD CONSTRAINT review_response_application_response_id_fkey FOREIGN KEY (application_response_id) REFERENCES public.application_response(id) ON DELETE CASCADE;


--
-- Name: review_response review_response_original_review_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response
    ADD CONSTRAINT review_response_original_review_response_id_fkey FOREIGN KEY (original_review_response_id) REFERENCES public.review_response(id) ON DELETE CASCADE;


--
-- Name: review_response review_response_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response
    ADD CONSTRAINT review_response_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.review(id) ON DELETE CASCADE;


--
-- Name: review_response review_response_review_response_link_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response
    ADD CONSTRAINT review_response_review_response_link_id_fkey FOREIGN KEY (review_response_link_id) REFERENCES public.review_response(id) ON DELETE CASCADE;


--
-- Name: review_response review_response_template_element_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_response
    ADD CONSTRAINT review_response_template_element_id_fkey FOREIGN KEY (template_element_id) REFERENCES public.template_element(id) ON DELETE CASCADE;


--
-- Name: review review_review_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_review_assignment_id_fkey FOREIGN KEY (review_assignment_id) REFERENCES public.review_assignment(id) ON DELETE CASCADE;


--
-- Name: review review_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review
    ADD CONSTRAINT review_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: review_status_history review_status_history_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.review_status_history
    ADD CONSTRAINT review_status_history_review_id_fkey FOREIGN KEY (review_id) REFERENCES public.review(id) ON DELETE CASCADE;


--
-- Name: template_action template_action_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_action
    ADD CONSTRAINT template_action_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: template_element template_element_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_element
    ADD CONSTRAINT template_element_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.template_section(id) ON DELETE CASCADE;


--
-- Name: template_filter_join template_filter_join_filter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_filter_join
    ADD CONSTRAINT template_filter_join_filter_id_fkey FOREIGN KEY (filter_id) REFERENCES public.filter(id);


--
-- Name: template_filter_join template_filter_join_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_filter_join
    ADD CONSTRAINT template_filter_join_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: template_permission template_permission_permission_name_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_permission
    ADD CONSTRAINT template_permission_permission_name_id_fkey FOREIGN KEY (permission_name_id) REFERENCES public.permission_name(id);


--
-- Name: template_permission template_permission_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_permission
    ADD CONSTRAINT template_permission_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: template_section template_section_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_section
    ADD CONSTRAINT template_section_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: template_stage_review_level template_stage_review_level_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_stage_review_level
    ADD CONSTRAINT template_stage_review_level_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.template_stage(id) ON DELETE CASCADE;


--
-- Name: template_stage template_stage_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template_stage
    ADD CONSTRAINT template_stage_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: template template_template_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.template
    ADD CONSTRAINT template_template_category_id_fkey FOREIGN KEY (template_category_id) REFERENCES public.template_category(id);


--
-- Name: trigger_schedule trigger_schedule_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_schedule
    ADD CONSTRAINT trigger_schedule_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: trigger_schedule trigger_schedule_editor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_schedule
    ADD CONSTRAINT trigger_schedule_editor_user_id_fkey FOREIGN KEY (editor_user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: trigger_schedule trigger_schedule_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trigger_schedule
    ADD CONSTRAINT trigger_schedule_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.template(id) ON DELETE CASCADE;


--
-- Name: user_organisation user_organisation_organisation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organisation
    ADD CONSTRAINT user_organisation_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisation(id) ON DELETE CASCADE;


--
-- Name: user_organisation user_organisation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_organisation
    ADD CONSTRAINT user_organisation_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: verification verification_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.application(id) ON DELETE CASCADE;


--
-- Name: application; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.application ENABLE ROW LEVEL SECURITY;

--
-- Name: application create_all_application; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY create_all_application ON public.application FOR INSERT WITH CHECK (true);


--
-- Name: application_response create_all_application_response; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY create_all_application_response ON public.application_response FOR INSERT WITH CHECK (true);


--
-- Name: review create_all_review; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY create_all_review ON public.review FOR INSERT WITH CHECK (true);


--
-- Name: review_assignment create_all_review_assignment; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY create_all_review_assignment ON public.review_assignment FOR INSERT WITH CHECK (true);


--
-- Name: application delete_all_application; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY delete_all_application ON public.application FOR DELETE USING (true);


--
-- Name: application_response delete_all_application_response; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY delete_all_application_response ON public.application_response FOR DELETE USING (true);


--
-- Name: review delete_all_revew; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY delete_all_revew ON public.review FOR DELETE USING (true);


--
-- Name: review_assignment delete_all_review_assignment; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY delete_all_review_assignment ON public.review_assignment FOR DELETE USING (true);


--
-- Name: review; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.review ENABLE ROW LEVEL SECURITY;

--
-- Name: review_assignment; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.review_assignment ENABLE ROW LEVEL SECURITY;

--
-- Name: application update_all_application; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY update_all_application ON public.application FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: application_response update_all_application_response; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY update_all_application_response ON public.application_response FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: review update_all_review; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY update_all_review ON public.review FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: review_assignment update_all_review_assignment; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY update_all_review_assignment ON public.review_assignment FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: application view_pp1; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp1 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp1'::text, true), ''::text) <> ''::text) AND (user_id = 1) AND ((session_id)::text = COALESCE(current_setting('jwt.claims.sessionId'::text, true), ''::text)) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp1_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: application view_pp2; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp2 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp2'::text, true), ''::text) <> ''::text) AND (user_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp2_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: application view_pp3; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp3 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp3'::text, true), ''::text) <> ''::text) AND (org_id = (COALESCE(NULLIF(current_setting('jwt.claims.orgId'::text, true), ''::text), '0'::text))::integer) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp3_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: application view_pp4; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp4 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp4'::text, true), ''::text) <> ''::text) AND (org_id = (COALESCE(NULLIF(current_setting('jwt.claims.orgId'::text, true), ''::text), '0'::text))::integer) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp4_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: review_assignment view_pp4; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp4 ON public.review_assignment FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp4'::text, true), ''::text) <> ''::text) AND (reviewer_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer)));


--
-- Name: application view_pp5; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp5 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp5'::text, true), ''::text) <> ''::text) AND (id IN ( SELECT review_assignment.application_id
   FROM public.review_assignment
  WHERE (review_assignment.reviewer_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer))) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp5_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: review_assignment view_pp5; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp5 ON public.review_assignment FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp5'::text, true), ''::text) <> ''::text) AND (reviewer_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer)));


--
-- Name: application view_pp6; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp6 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp6'::text, true), ''::text) <> ''::text) AND (id IN ( SELECT review_assignment.application_id
   FROM public.review_assignment
  WHERE (review_assignment.reviewer_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer))) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp6_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: review_assignment view_pp6; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp6 ON public.review_assignment FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp6'::text, true), ''::text) <> ''::text) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp6_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: application view_pp7; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp7 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp7'::text, true), ''::text) <> ''::text) AND (id IN ( SELECT review_assignment.application_id
   FROM public.review_assignment
  WHERE (review_assignment.id IN ( SELECT review_assignment_assigner_join.review_assignment_id
           FROM public.review_assignment_assigner_join
          WHERE (review_assignment_assigner_join.assigner_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer))))) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp7_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: review view_pp7; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp7 ON public.review FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp7'::text, true), ''::text) <> ''::text) AND (review_assignment_id IN ( SELECT review_assignment.id
   FROM public.review_assignment
  WHERE (review_assignment.template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp7_template_ids'::text, true), '0'::text), ','::text))::integer[]))))));


--
-- Name: review_assignment view_pp7; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp7 ON public.review_assignment FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp7'::text, true), ''::text) <> ''::text) AND (id IN ( SELECT review_assignment_assigner_join.review_assignment_id
   FROM public.review_assignment_assigner_join
  WHERE (review_assignment_assigner_join.assigner_id = (COALESCE(NULLIF(current_setting('jwt.claims.userId'::text, true), ''::text), '0'::text))::integer))) AND (template_id = ANY ((string_to_array(COALESCE(current_setting('jwt.claims.pp7_template_ids'::text, true), '0'::text), ','::text))::integer[]))));


--
-- Name: application view_pp8; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY view_pp8 ON public.application FOR SELECT USING (((COALESCE(current_setting('jwt.claims.pp8'::text, true), ''::text) <> ''::text) AND (template_id >= 0)));


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

GRANT ALL ON SCHEMA public TO graphile_user;


--
-- Name: TABLE application_list_shape; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.application_list_shape TO graphile_user;


--
-- Name: TABLE application; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application TO graphile_user;


--
-- Name: TABLE review_assignment; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_assignment TO graphile_user;


--
-- Name: TABLE review; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review TO graphile_user;


--
-- Name: TABLE review_decision; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_decision TO graphile_user;


--
-- Name: TABLE template_action; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_action TO graphile_user;


--
-- Name: TABLE template_element; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_element TO graphile_user;


--
-- Name: TABLE action_plugin; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.action_plugin TO graphile_user;


--
-- Name: SEQUENCE action_plugin_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.action_plugin_id_seq TO graphile_user;


--
-- Name: TABLE action_queue; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.action_queue TO graphile_user;


--
-- Name: SEQUENCE action_queue_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.action_queue_id_seq TO graphile_user;


--
-- Name: TABLE activity_log; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.activity_log TO graphile_user;


--
-- Name: SEQUENCE activity_log_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.activity_log_id_seq TO graphile_user;


--
-- Name: SEQUENCE application_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.application_id_seq TO graphile_user;


--
-- Name: TABLE application_note; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_note TO graphile_user;


--
-- Name: SEQUENCE application_note_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.application_note_id_seq TO graphile_user;


--
-- Name: TABLE application_response; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_response TO graphile_user;


--
-- Name: SEQUENCE application_response_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.application_response_id_seq TO graphile_user;


--
-- Name: TABLE application_stage_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_stage_history TO graphile_user;


--
-- Name: SEQUENCE application_stage_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.application_stage_history_id_seq TO graphile_user;


--
-- Name: TABLE application_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_status_history TO graphile_user;


--
-- Name: TABLE template; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template TO graphile_user;


--
-- Name: TABLE template_stage; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_stage TO graphile_user;


--
-- Name: TABLE application_stage_status_all; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_stage_status_all TO graphile_user;


--
-- Name: TABLE application_stage_status_latest; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.application_stage_status_latest TO graphile_user;


--
-- Name: SEQUENCE application_status_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.application_status_history_id_seq TO graphile_user;


--
-- Name: TABLE constraints_info; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.constraints_info TO graphile_user;


--
-- Name: TABLE counter; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.counter TO graphile_user;


--
-- Name: TABLE data_table; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.data_table TO graphile_user;


--
-- Name: SEQUENCE data_table_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.data_table_id_seq TO graphile_user;


--
-- Name: TABLE data_view; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.data_view TO graphile_user;


--
-- Name: TABLE data_view_column_definition; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.data_view_column_definition TO graphile_user;


--
-- Name: SEQUENCE data_view_column_definition_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.data_view_column_definition_id_seq TO graphile_user;


--
-- Name: SEQUENCE data_view_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.data_view_id_seq TO graphile_user;


--
-- Name: TABLE element_type_plugin; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.element_type_plugin TO graphile_user;


--
-- Name: TABLE file; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.file TO graphile_user;


--
-- Name: SEQUENCE file_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.file_id_seq TO graphile_user;


--
-- Name: TABLE filter; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.filter TO graphile_user;


--
-- Name: SEQUENCE filter_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.filter_id_seq TO graphile_user;


--
-- Name: TABLE notification; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notification TO graphile_user;


--
-- Name: SEQUENCE notification_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.notification_id_seq TO graphile_user;


--
-- Name: TABLE organisation; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.organisation TO graphile_user;


--
-- Name: SEQUENCE organisation_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.organisation_id_seq TO graphile_user;


--
-- Name: TABLE permission_join; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permission_join TO graphile_user;


--
-- Name: SEQUENCE permission_join_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.permission_join_id_seq TO graphile_user;


--
-- Name: TABLE permission_name; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permission_name TO graphile_user;


--
-- Name: SEQUENCE permission_name_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.permission_name_id_seq TO graphile_user;


--
-- Name: TABLE permission_policy; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permission_policy TO graphile_user;


--
-- Name: SEQUENCE permission_policy_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.permission_policy_id_seq TO graphile_user;


--
-- Name: TABLE template_category; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_category TO graphile_user;


--
-- Name: TABLE template_permission; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_permission TO graphile_user;


--
-- Name: TABLE "user"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public."user" TO graphile_user;


--
-- Name: TABLE permissions_all; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.permissions_all TO graphile_user;


--
-- Name: TABLE postgres_row_level; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.postgres_row_level TO graphile_user;


--
-- Name: TABLE review_assignment_assigner_join; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_assignment_assigner_join TO graphile_user;


--
-- Name: SEQUENCE review_assignment_assigner_join_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_assignment_assigner_join_id_seq TO graphile_user;


--
-- Name: SEQUENCE review_assignment_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_assignment_id_seq TO graphile_user;


--
-- Name: SEQUENCE review_decision_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_decision_id_seq TO graphile_user;


--
-- Name: SEQUENCE review_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_id_seq TO graphile_user;


--
-- Name: TABLE review_response; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_response TO graphile_user;


--
-- Name: SEQUENCE review_response_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_response_id_seq TO graphile_user;


--
-- Name: TABLE review_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.review_status_history TO graphile_user;


--
-- Name: SEQUENCE review_status_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.review_status_history_id_seq TO graphile_user;


--
-- Name: TABLE schema_columns; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.schema_columns TO graphile_user;


--
-- Name: TABLE system_info; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.system_info TO graphile_user;


--
-- Name: SEQUENCE template_action_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_action_id_seq TO graphile_user;


--
-- Name: SEQUENCE template_category_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_category_id_seq TO graphile_user;


--
-- Name: SEQUENCE template_element_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_element_id_seq TO graphile_user;


--
-- Name: TABLE template_filter_join; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_filter_join TO graphile_user;


--
-- Name: SEQUENCE template_filter_join_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_filter_join_id_seq TO graphile_user;


--
-- Name: SEQUENCE template_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_id_seq TO graphile_user;


--
-- Name: SEQUENCE template_permission_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_permission_id_seq TO graphile_user;


--
-- Name: TABLE template_section; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_section TO graphile_user;


--
-- Name: SEQUENCE template_section_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_section_id_seq TO graphile_user;


--
-- Name: SEQUENCE template_stage_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_stage_id_seq TO graphile_user;


--
-- Name: TABLE template_stage_review_level; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.template_stage_review_level TO graphile_user;


--
-- Name: SEQUENCE template_stage_review_level_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.template_stage_review_level_id_seq TO graphile_user;


--
-- Name: TABLE trigger_queue; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.trigger_queue TO graphile_user;


--
-- Name: SEQUENCE trigger_queue_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.trigger_queue_id_seq TO graphile_user;


--
-- Name: TABLE trigger_schedule; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.trigger_schedule TO graphile_user;


--
-- Name: SEQUENCE trigger_schedule_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.trigger_schedule_id_seq TO graphile_user;


--
-- Name: SEQUENCE user_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_id_seq TO graphile_user;


--
-- Name: TABLE user_organisation; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_organisation TO graphile_user;


--
-- Name: TABLE user_org_join; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.user_org_join TO graphile_user;


--
-- Name: SEQUENCE user_organisation_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_organisation_id_seq TO graphile_user;


--
-- Name: TABLE verification; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.verification TO graphile_user;


--
-- Name: SEQUENCE verification_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.verification_id_seq TO graphile_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES  TO graphile_user;


--
-- Name: postgraphile_watch_ddl; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER postgraphile_watch_ddl ON ddl_command_end
         WHEN TAG IN ('ALTER AGGREGATE', 'ALTER DOMAIN', 'ALTER EXTENSION', 'ALTER FOREIGN TABLE', 'ALTER FUNCTION', 'ALTER POLICY', 'ALTER SCHEMA', 'ALTER TABLE', 'ALTER TYPE', 'ALTER VIEW', 'COMMENT', 'CREATE AGGREGATE', 'CREATE DOMAIN', 'CREATE EXTENSION', 'CREATE FOREIGN TABLE', 'CREATE FUNCTION', 'CREATE INDEX', 'CREATE POLICY', 'CREATE RULE', 'CREATE SCHEMA', 'CREATE TABLE', 'CREATE TABLE AS', 'CREATE VIEW', 'DROP AGGREGATE', 'DROP DOMAIN', 'DROP EXTENSION', 'DROP FOREIGN TABLE', 'DROP FUNCTION', 'DROP INDEX', 'DROP OWNED', 'DROP POLICY', 'DROP RULE', 'DROP SCHEMA', 'DROP TABLE', 'DROP TYPE', 'DROP VIEW', 'GRANT', 'REVOKE', 'SELECT INTO')
   EXECUTE FUNCTION postgraphile_watch.notify_watchers_ddl();


ALTER EVENT TRIGGER postgraphile_watch_ddl OWNER TO postgres;

--
-- Name: postgraphile_watch_drop; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER postgraphile_watch_drop ON sql_drop
   EXECUTE FUNCTION postgraphile_watch.notify_watchers_drop();


ALTER EVENT TRIGGER postgraphile_watch_drop OWNER TO postgres;

--
-- PostgreSQL database dump complete
--

