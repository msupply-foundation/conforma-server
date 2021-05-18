-- Aggregated VIEW method to get list of assigners usernames and allow filtering by assigner on the application list page
CREATE FUNCTION assigners_list ()
    RETURNS TABLE (
        application_id int,
        stage_id int,
        assigner_usernames varchar[]
    )
    AS $$
    SELECT
        review_assignment.application_id,
        review_assignment.stage_id,
        ARRAY_AGG (DISTINCT (assigner_user.username)) AS assigner_usernames
    FROM
        review_assignment
    LEFT JOIN "user" AS assigner_user ON review_assignment.assigner_id = assigner_user.id
    -- WHERE assigner_user IS NOT NULL
GROUP BY
    review_assignment.application_id,
    review_assignment.stage_id;
$$
LANGUAGE sql
STABLE;