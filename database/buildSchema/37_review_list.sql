-- Aggregated VIEW method of all related review data to each application on application list page
CREATE TYPE public.reviewer_action AS ENUM (
    'SELF_ASSIGN',
    'START_REVIEW',
    'VIEW_REVIEW',
    'CONTINUE_REVIEW',
    'RESTART_REVIEW',
    'UPDATE_REVIEW'
);

CREATE FUNCTION review_list (reviewerid int)
    RETURNS TABLE (
        application_id int,
        reviewer_action public.reviewer_action,
        -- TODO: Remove each following filters after replacing with reviewer_action...
        -- SELF_ASSIGN
        review_available_for_self_assignment_count bigint,
        -- VIEW_REVIEW
        review_assigned_count bigint, 
        -- START_REVIEW
        review_assigned_not_started_count bigint, 
        -- CONTINUE_REVIEW
        review_draft_count bigint, 
        -- VIEW_REVIEW
        review_submitted_count bigint, 
        -- UPDATE_REVIEW
        review_change_request_count bigint,
        -- RESTART_REVIEW
        review_pending_count bigint
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        -- TODO: Change order to list more relevants first 
        CASE 
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'AVAILABLE_FOR_SELF_ASSIGNMENT') >= 1 
                THEN 'SELF_ASSIGN'
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED' OR review_status_history.status = 'SUBMITTED') >= 1 
                THEN 'VIEW_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED' AND review.id IS NULL) >= 1
                THEN 'START_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'DRAFT') >= 1
                THEN 'CONTINUE_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'CHANGES_REQUESTED') >= 1 
                THEN 'UPDATE_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'PENDING') >= 1
                THEN 'RESTART_REVIEW'
            ELSE NULL
        END::public.reviewer_action,
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

