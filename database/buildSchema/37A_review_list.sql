-- Aggregated VIEW method of all related review data to each application on application list page
CREATE FUNCTION review_list (reviewerid int)
    RETURNS TABLE (
        application_id int,
        review_available_for_self_assignment_count bigint,
        review_assigned_count bigint,
        review_assigned_not_started_count bigint,
        review_draft_count bigint,
        review_submitted_count bigint,
        review_change_request_count bigint,
        review_pending_count bigint
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        COUNT(*) FILTER (WHERE review_assignment.status = 'AVAILABLE_FOR_SELF_ASSIGNMENT') AS review_available_for_self_assignment_count,
        COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED') AS review_assigned_count,
        COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED'
            AND review.id IS NULL) AS review_assigned_not_started_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'DRAFT') AS review_draft_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'SUBMITTED') AS review_submitted_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'CHANGES_REQUESTED') AS review_change_request_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'PENDING') AS review_pending_count
    FROM
        review_assignment
    LEFT JOIN review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
WHERE
    review_assignment.reviewer_id = $1
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

