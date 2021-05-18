-- Aggregated VIEW method to get list of reveiwers usernames and allow filtering by reviewer on the application list page
CREATE FUNCTION reviewers_list ()
    RETURNS TABLE (
        application_id int,
        stage_id int,
        status public.review_assignment_status,
        reviewer_usernames varchar[]
    )
    AS $$
    SELECT
        review_assignment.application_id,
        review_assignment.stage_id,
        review_assignment.status,
        ARRAY_AGG (DISTINCT (reviewer_user.username)) AS reviewer_usernames
    FROM
        review_assignment
    LEFT JOIN "user" AS reviewer_user ON review_assignment.reviewer_id = reviewer_user.id
GROUP BY
    review_assignment.application_id,
    review_assignment.stage_id,
    review_assignment.status;
$$
LANGUAGE sql
STABLE;