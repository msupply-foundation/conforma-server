-- Aggregated VIEW method of all data required for application list page
-- Requires an empty table as setof return and smart comment to make orderBy work (https://github.com/graphile/graphile-engine/pull/378)
CREATE TABLE application_list_shape (
    id int,
    "serial" varchar,
    "name" varchar,
    template_code varchar,
    template_name varchar,
    applicant_username varchar,
    applicant_first_name varchar,
    applicant_last_name varchar,
    applicant varchar,
    org_name varchar,
    stage varchar,
    stage_colour varchar,
    "status" public.application_status,
    outcome public.application_outcome,
    last_active_date timestamptz,
    assigner_usernames varchar[],
    reviewer_usernames varchar[],
    reviewer_action public.reviewer_action,
    assigner_action public.assigner_action,
    is_fully_assigned_level_1 boolean,
    total_questions bigint,
    assigned_questions bigint,
    assign_reviewer_assigned_count bigint,
    assign_reviewers_count bigint,
    assign_count bigint
);

CREATE FUNCTION application_list (userid int DEFAULT 0)
    RETURNS SETOF application_list_shape
    AS $$
    SELECT
        app.id,
        app.serial,
        app.name,
        template.code AS template_code,
        template.name AS template_name,
        username AS applicant_username,
        first_name AS applicant_first_name,
        last_name AS applicant_last_name,
        CONCAT(first_name, ' ', last_name) AS applicant,
        org.name AS org_name,
        stage_status.stage,
        stage_status.stage_colour,
        stage_status.status,
        app.outcome,
        status_history_time_created AS last_active_date,
        assigner_usernames,
        reviewer_usernames,
        reviewer_action,
        assigner_action,
        is_fully_assigned_level_1,
        total_questions,
        assigned_questions,
        assign_reviewer_assigned_count,
        assign_reviewers_count,
        assign_count
    FROM
        application app
    LEFT JOIN TEMPLATE ON app.template_id = template.id
    LEFT JOIN "user" ON user_id = "user".id
    LEFT JOIN application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
    LEFT JOIN organisation org ON app.org_id = org.id
    LEFT JOIN assignment_list (stage_status.stage_id) ON app.id = assignment_list.application_id
    LEFT JOIN review_list (stage_status.stage_id, $1) ON app.id = review_list.application_id
    LEFT JOIN assigner_list (stage_status.stage_id, $1) ON app.id = assigner_list.application_id
$$
LANGUAGE sql
STABLE;

-- (https://github.com/graphile/graphile-engine/pull/378)
COMMENT ON FUNCTION application_list (userid int) IS E'@sortable';

