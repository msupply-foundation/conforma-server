-- Create VIEW which collects application, stage and status information together

CREATE VIEW public.application_stage_status AS
				(SELECT app.id,
						name,
						ts.number AS stage_number,
						ts.title AS stage,
						status
					FROM application app
					JOIN application_stage_history stage ON app.id = stage.application_id
					JOIN template_stage ts ON stage.stage_id = ts.id
					JOIN application_status_history status ON stage.id = status.application_stage_history_id
					WHERE stage.is_current = TRUE
									AND status.is_current = TRUE );

-- Function to expose stage_number field on application table in GraphQL

CREATE FUNCTION public.application_stage_number(app public.application) RETURNS INT AS $$
	SELECT stage_number FROM
		( SELECT id, stage_number FROM
			public.application_stage_status ) AS app_stage_num
	WHERE app_stage_num.id = app.id
$$ LANGUAGE sql STABLE;

-- Function to expose stage name field on application table in GraphQL

CREATE FUNCTION public.application_stage(app public.application) RETURNS VARCHAR AS $$
	SELECT stage FROM
		( SELECT id, stage FROM
			public.application_stage_status	) AS app_stage
	WHERE app_stage.id = app.id
$$ LANGUAGE sql STABLE;

-- Function to expose status field on application table in GraphQL

CREATE FUNCTION public.application_status(a public.application) RETURNS application_status AS $$
	SELECT status FROM
		( SELECT id, status FROM
			public.application_stage_status ) AS app_status
	WHERE app_status.id = a.id
$$ LANGUAGE sql STABLE;