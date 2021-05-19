-- Aggregated VIEW method to get list of assigners and reviewers usernames to allow filtering by those on the application list page
CREATE FUNCTION assignment_list (stageid int)
    RETURNS TABLE (
        application_id int,
        reviewer_usernames varchar[],
        assigner_usernames varchar[]
    )
    AS $$
    SELECT
        review_assignment.application_id,
        ARRAY_AGG (DISTINCT (reviewer_user.username)) AS reviewer_usernames,
        ARRAY_AGG (DISTINCT (assigner_user.username)) AS assigner_usernames
    FROM
        review_assignment
    LEFT JOIN "user" AS assigner_user ON review_assignment.assigner_id = assigner_user.id
    LEFT JOIN "user" AS reviewer_user ON review_assignment.reviewer_id = reviewer_user.id
    WHERE
        review_assignment.stage_id = $1 AND review_assignment.status = 'ASSIGNED'
    -- WHERE assigner_user IS NOT NULL
GROUP BY
    review_assignment.application_id;
$$
LANGUAGE sql
STABLE;