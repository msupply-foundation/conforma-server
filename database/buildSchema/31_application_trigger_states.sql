-- VIEW table to show all table trigger states
CREATE OR REPLACE VIEW application_trigger_states AS
SELECT 
	application.id, serial, application."trigger" as application_trigger,
	review."trigger" as review_trigger
FROM application
LEFT JOIN review ON application.id = review.application_id;

-- ADD more as we create them