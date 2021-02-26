


-- Aggregated VIEW table of all data required for application list page
-- Now review_status_list is joined (see comment in declaration), it needs to be filtered by reviewer_id (current user_id)
-- every time it's quired by front end to avoid duplicates and allow relevant review status information to be shown
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
	-- 	template_questions_count(app),
	-- 	assigned_questions_count(app, stage_status.stage_id, 1),
		assigned_questions_count(app, stage_status.stage_id, 1) >= template_questions_count(app)
		AS is_fully_assigned_level_1,
		review_status_list.*
	FROM application app LEFT JOIN
	template ON app.template_id = template.id LEFT JOIN
	"user" ON user_id = "user".id LEFT JOIN
	application_stage_status_latest AS stage_status
	on app.id = stage_status.application_id
	LEFT JOIN organisation org ON app.org_id = org.id
	LEFT JOIN review_status_list on review_status_list.application_id = app.id
-- TO-DO:
	-- Expiry Date
	-- Consolidator name
	-- Consolidation status
	-- Consolidation Date
	-- Reviewer(s)?
	-- Review status and Date for current user
