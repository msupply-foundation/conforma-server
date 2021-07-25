-- Aggregated VIEW method of reviewer action to each application on application list page
CREATE TYPE public.reviewer_action AS ENUM (
    'SELF_ASSIGN',
    'START_REVIEW',
    'VIEW_REVIEW',
    'CONTINUE_REVIEW',
    'MAKE_DECISION',
    'RESTART_REVIEW',
    'UPDATE_REVIEW'
);

CREATE FUNCTION review_list (stageid int, reviewerid int)
    RETURNS TABLE (
        application_id int,
        reviewer_action public.reviewer_action
    )
    AS $$
    SELECT
        review_assignment.application_id AS application_id,
        CASE 
            WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'CHANGES_REQUESTED') != 0
                THEN 'UPDATE_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'PENDING') != 0
                THEN 'RESTART_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_status_history.status = 'DRAFT') != 0
                THEN 'CONTINUE_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED' 
                                    AND review_assignment.is_final_decision = TRUE
                                    AND review_assignment.is_last_stage = TRUE) != 0
                THEN 'MAKE_DECISION'
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED' AND review.id IS NULL) != 0
                THEN 'START_REVIEW'
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'AVAILABLE_FOR_SELF_ASSIGNMENT') != 0
                THEN 'SELF_ASSIGN'
            WHEN COUNT(*) FILTER (WHERE review_assignment.status = 'ASSIGNED' OR review_status_history.status = 'SUBMITTED') != 0
                THEN 'VIEW_REVIEW'
            ELSE NULL
        END::public.reviewer_action
    FROM
        review_assignment
    LEFT JOIN review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
WHERE review_assignment.stage_id = $1
    AND review_assignment.reviewer_id = $2
GROUP BY
    review_assignment.application_id;

$$
LANGUAGE sql
STABLE;

