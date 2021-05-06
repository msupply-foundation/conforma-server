-- Aggregated VIEW method of all related assigner data to each application on application list page
CREATE FUNCTION assigner_list (assignerid int)
    RETURNS TABLE (
        application_id int,
        assign_reviewer_assigned_count bigint,
        assign_reviewers_count bigint,
        assign_count bigint
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
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

