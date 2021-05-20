-- Aggregated VIEW method of all related assigner data to each application on application list page
CREATE TYPE public.assigner_action as ENUM (
    'ASSIGN',
    'RE_ASSIGN'
);

CREATE FUNCTION assigner_list (stageid int, assignerid int)
    RETURNS TABLE (
        application_id int,
        assigner_action public.assigner_action,
        assigned_questions bigint,
        total_questions bigint,
        is_fully_assigned_level_1 boolean,
        -- TODO: Remove each following filters after replacing with assigner_action...
        assign_reviewer_assigned_count bigint,
        assign_reviewers_count bigint,
        assign_count bigint
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        CASE
            WHEN COUNT(DISTINCT (review_assignment.id)) != 0 AND assigned_questions_count(application_id, $1, 1) >= template_questions_count(application_id) 
                THEN 'RE_ASSIGN'
            WHEN COUNT(DISTINCT (review_assignment.id)) != 0 AND assigned_questions_count(application_id, $1, 1) < template_questions_count(application_id)
                THEN 'ASSIGN'
            ELSE NULL
        END::assigner_action,
        assigned_questions_count(application_id, $1, 1) AS assigned_questions,
        template_questions_count(application_id) AS total_questions,
        assigned_questions_count(application_id, $1, 1) = template_questions_count(application_id) AS is_fully_assigned_level_1,
        COUNT(DISTINCT (review_assignment.reviewer_id)) FILTER (WHERE review_assignment.status = 'ASSIGNED') AS assign_reviewer_assigned_count,
        COUNT(DISTINCT (review_assignment.reviewer_id)) AS assign_reviewers_count,
        COUNT(DISTINCT (review_assignment.id)) AS assign_count
    FROM
        review_assignment
    LEFT JOIN review_assignment_assigner_join ON review_assignment.id = review_assignment_assigner_join.review_assignment_id
WHERE 
    review_assignment.stage_id = $1
    AND review_assignment_assigner_join.assigner_id = $2
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

