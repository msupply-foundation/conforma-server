-- Aggregated VIEW method of all related assigner data to each application on application list page
CREATE TYPE public.assigner_action AS ENUM (
    'ASSIGN',
    'ASSIGN_LOCKED',
    'RE_ASSIGN'
);

CREATE OR REPLACE FUNCTION assigner_list (stage_id int, assigner_id int)
    RETURNS TABLE (
        application_id int,
        assigner_action public.assigner_action
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        CASE WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) >= reviewable_questions_count (application_id)
            AND submitted_assigned_questions_count (application_id, $1, level_number) < assigned_questions_count (application_id, $1, level_number) THEN
            'RE_ASSIGN'
        WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) >= reviewable_questions_count (application_id)
            AND submitted_assigned_questions_count (application_id, $1, level_number) >= assigned_questions_count (application_id, $1, level_number) THEN
            'ASSIGN_LOCKED'
        WHEN COUNT(DISTINCT (review_assignment.id)) != 0
            AND assigned_questions_count (application_id, $1, level_number) < reviewable_questions_count (application_id) THEN
            'ASSIGN'
        ELSE
            NULL
        END::assigner_action
    FROM
        review_assignment
    LEFT JOIN review_assignment_assigner_join ON review_assignment.id = review_assignment_assigner_join.review_assignment_id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment_assigner_join.assigner_id = $2
    AND (
        SELECT
            outcome
        FROM
            application
        WHERE
            id = review_assignment.application_id) = 'PENDING'
GROUP BY
    review_assignment.application_id,
    review_assignment.level_number;

$$
LANGUAGE sql
STABLE;

