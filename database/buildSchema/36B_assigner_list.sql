-- Aggregated VIEW method of all related assigner data to each application on application list page
CREATE TYPE public.assigner_action as ENUM (
    'ASSIGN',
    'RE_ASSIGN'
    ''
);

CREATE FUNCTION assigner_list (assignerid int, is_fully_assigned_level_1 boolean)
    RETURNS TABLE (
        application_id int,
        assigner_action public.assigner_action,
        -- TODO: Remove each following filters after replacing with assigner_action...
        assign_reviewer_assigned_count bigint,
        assign_reviewers_count bigint,
        assign_count bigint
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        CASE
            WHEN COUNT(DISTINCT (review_assignment.id)) >= 1 AND is_fully_assigned_level_1 = false THEN 'ASSIGN'
            WHEN COUNT(DISTINCT (review_assignment.id)) >= 1 AND is_fully_assigned_level_1 = true THEN 'RE-ASSIGN'
            ELSE NULL
        END::assigner_action,
        COUNT(DISTINCT (review_assignment.reviewer_id)) FILTER (WHERE review_assignment.status = 'ASSIGNED') AS assign_reviewer_assigned_count,
        COUNT(DISTINCT (review_assignment.reviewer_id)) AS assign_reviewers_count,
        COUNT(DISTINCT (review_assignment.id)) AS assign_count
    FROM
        review_assignment
    LEFT JOIN review_assignment_assigner_join ON review_assignment.id = review_assignment_assigner_join.review_assignment_id
WHERE
    review_assignment_assigner_join.assigner_id = $1
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

