-- Aggregated VIEW method of all data required for application list page
-- Requires an empty table as setof return and smart comment to make orderBy work (https://github.com/graphile/graphile-engine/pull/378)
CREATE TABLE IF NOT EXISTS application_list_shape (
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

