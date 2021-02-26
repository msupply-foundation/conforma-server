-- Aggregated VIEW table of review data required in application_list_view
-- The reason for CROSS JOIN is to have all combinations of reviewer/application exposed to
-- application_list_view <- when it's filtered by reviewer_id, relevant review information
-- for current user is shown (without affecting application list details or showing review info for other users)
CREATE OR REPLACE VIEW review_status_list AS
SELECT
    COUNT(*) FILTER (WHERE review_assignment.status = 'Available for self-assignment') AS number_of_self_assignable_reviews,
    COUNT(*) FILTER (WHERE review_assignment.status = 'Assigned') AS number_of_assigned_reviews,
    COUNT(*) FILTER (WHERE review_assignment.status = 'Assigned'
        AND review.id IS NULL) AS number_of_assigned_not_started_reviews,
    COUNT(*) FILTER (WHERE review_assignment.status = 'Self-assigned by another') AS number_of_reviews_self_assigned_by_someone_else,
    COUNT(*) FILTER (WHERE review_status_history.status = 'Draft') AS number_of_draft_reviews,
    COUNT(*) FILTER (WHERE review_status_history.status = 'Submitted') AS number_of_submitted_reviews,
    COUNT(*) FILTER (WHERE review_status_history.status = 'Changes Requested') AS number_of_changes_requested_reviews,
    "user".id AS reviewer_id,
    application.id AS application_id
FROM
    "user"
    CROSS JOIN application
    LEFT JOIN review_assignment ON review_assignment.application_id = application.id
        AND "review_assignment".reviewer_id = "user".id
    LEFT JOIN review ON review.review_assignment_id = review_assignment.id
    LEFT JOIN review_status_history ON (review_status_history.review_id = review.id
            AND is_current = TRUE)
GROUP BY
    "user".id,
    application.id
