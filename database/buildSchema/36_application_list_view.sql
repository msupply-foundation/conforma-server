-- Aggregated VIEW table of all data required for application list page

CREATE OR REPLACE VIEW "public".application_list AS
 SELECT 
	app.id, app.serial, app.name,
	template.code as template_code,
    template.name as template_name,
	username as applicant_username,
	first_name as applicant_first_name,
	last_name as applicant_last_name,
	CONCAT(first_name, ' ', last_name) as applicant,
	org.name as org_name,
	stage_status.stage, stage_status.status, outcome,
	status_history_time_created as last_active_date,
-- 	template_question_count(app.id),
-- 	assigned_question_count,
	assigned_question_count >= template_question_count(app.id) as is_fully_assigned
FROM application app LEFT JOIN
template ON app.template_id = template.id LEFT JOIN
"user" ON user_id = "user".id LEFT JOIN
	(SELECT * FROM application_stage_status_latest)
AS stage_status on app.id = stage_status.application_id
LEFT JOIN organisation org ON app.org_id = org.id
LEFT JOIN (
	SELECT DISTINCT(review_assignment.application_id), assigned_questions_count(review_assignment) as assigned_question_count
	FROM review_assignment JOIN
	application_stage_status_latest assl
	ON review_assignment.application_id = assl.application_id
	AND review_assignment.stage_id = assl.stage_id
	) ra
ON app.id = ra.application_id;
-- TO-DO:
	-- Expiry Date
	-- Consolidator name
	-- Consolidation status
	-- Consolidation Date
	-- Reviewer(s)?
	-- Review status and Date for current user
