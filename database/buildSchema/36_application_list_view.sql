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
	(
	WITH count_unassigned_sections AS (
		WITH unassigned_sections AS (
			(SELECT ts.id AS sections FROM
			template_section ts JOIN application a
			ON ts.template_id = a.template_id
			WHERE a.id = app.id)
				
			EXCEPT
					
			(SELECT DISTINCT unnest(available_template_section_ids) AS sections
			FROM review_assignment
			WHERE application_id = app.id
			AND level=(
				SELECT MAX(level) FROM review_assignment
				WHERE application_id = app.id
				)
			AND status = 'Assigned'
			AND stage_id = (
					SELECT stage_id FROM application_stage_status_all
					WHERE application_id = app.id AND stage_is_current = true
					)
				) 
			)
		SELECT COUNT(*) FROM unassigned_sections
		)
	SELECT CASE
		WHEN count = 0 THEN true
		ELSE false
		END AS is_fully_assigned
	from count_unassigned_sections
	)
FROM application app LEFT JOIN
template ON app.template_id = template.id LEFT JOIN
"user" ON user_id = "user".id LEFT JOIN
	(SELECT * FROM application_stage_status_all WHERE
	stage_is_current = true AND status_is_current = true)
AS stage_status on app.id = stage_status.application_id
LEFT JOIN organisation org ON app.org_id = org.id;
-- TO-DO:
	-- Expiry Date
	-- Consolidator name
	-- Consolidation status
	-- Consolidation Date
	-- Reviewer(s)?
	-- Review status and Date for current user
