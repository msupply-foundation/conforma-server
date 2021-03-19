-- Aggregated VIEW method of review data, used in application_list for application list page
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
        COUNT(*) FILTER (WHERE review_assignment.status = 'Available for self-assignment') AS review_available_for_self_assignment_count,
        COUNT(*) FILTER (WHERE review_assignment.status = 'Assigned') AS review_assigned_count,
        COUNT(*) FILTER (WHERE review_assignment.status = 'Assigned'
            AND review.id IS NULL) AS review_assigned_not_started_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'Draft') AS review_draft_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'Submitted') AS review_submitted_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'Changes Requested') AS review_change_request_count,
        COUNT(*) FILTER (WHERE review_status_history.status = 'Changes Requested') AS review_pending_count
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

