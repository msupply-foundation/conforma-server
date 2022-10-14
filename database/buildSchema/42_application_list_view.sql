-- Aggregated VIEW method of all data required for application list page
-- Requires an empty table as setof return and smart comment to make orderBy work (https://github.com/graphile/graphile-engine/pull/378)
CREATE TABLE application_list_shape (
    id int,
    "serial" varchar,
    "name" varchar,
    template_code varchar,
    template_name varchar,
    applicant varchar,
    org_name varchar,
    stage varchar,
    stage_colour varchar,
    "status" public.application_status,
    outcome public.application_outcome,
    last_active_date timestamptz,
    applicant_deadline timestamptz,
    -- TO-DO: reviewer_deadline
    assigners varchar[],
    reviewers varchar[],
    reviewer_action public.reviewer_action,
    assigner_action public.assigner_action
);

CREATE OR REPLACE FUNCTION application_list (userid int DEFAULT 0)
    RETURNS SETOF application_list_shape
    AS $$
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
        application app
    LEFT JOIN TEMPLATE ON app.template_id = template.id
    LEFT JOIN "user" ON user_id = "user".id
    LEFT JOIN application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
    LEFT JOIN organisation org ON app.org_id = org.id
    LEFT JOIN assignment_list (stage_status.stage_id) ON app.id = assignment_list.application_id
    LEFT JOIN review_list (stage_status.stage_id, $1, stage_status.status) ON app.id = review_list.application_id
    LEFT JOIN assigner_list (stage_status.stage_id, $1) ON app.id = assigner_list.application_id
    LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
        AND ts.is_active = TRUE
        AND ts.event_code = 'applicantDeadline'
WHERE
    app.is_config = FALSE
$$
LANGUAGE sql
STABLE;

-- (https://github.com/graphile/graphile-engine/pull/378)
COMMENT ON FUNCTION application_list (userid int) IS E'@sortable';
