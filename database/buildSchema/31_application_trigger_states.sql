-- VIEW table to show all table trigger states
CREATE OR REPLACE VIEW application_trigger_states AS
SELECT 
	serial, application.id as application_id,
	application."trigger" as application_trigger,
	review_assignment.id as review_assignment_id,
	review_assignment."trigger" as review_assignment_trigger,
	review.id as review_id,
	review."trigger" as review_trigger
FROM application
LEFT JOIN review_assignment ON application.id = review_assignment.application_id
LEFT JOIN review ON application.id = review.application_id;


-- ADD more as we create them