-- Aggregated VIEW method to get list of assigners and reviewers usernames to allow filtering by those on the application list page
CREATE FUNCTION assignment_list (stageid int)
    RETURNS TABLE (
        application_id int,
        reviewers varchar[],
        assigners varchar[]
    )
    AS $$
    SELECT
        review_assignment.application_id,
        ARRAY_AGG(DISTINCT (CONCAT(reviewer_user.first_name, ' ', reviewer_user.last_name)::varchar)) AS reviewers,
        ARRAY_AGG(DISTINCT (CONCAT(assigner_user.first_name, ' ', assigner_user.last_name)::varchar)) AS assigners
    FROM
        review_assignment
    LEFT JOIN "user" AS assigner_user ON review_assignment.assigner_id = assigner_user.id
    LEFT JOIN "user" AS reviewer_user ON review_assignment.reviewer_id = reviewer_user.id
WHERE
    review_assignment.stage_id = $1
    AND review_assignment.status = 'ASSIGNED'
    -- WHERE assigner_user IS NOT NULL
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

