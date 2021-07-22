-- Create VIEW which collects ALL application, stage, stage_history, and status_history together
CREATE OR REPLACE VIEW public.application_stage_status_all AS
SELECT
    stage.application_id,
    ts.template_id,
    template.name AS template_name,
    template.code AS template_code,
    serial,
    application.name,
    user_id,
    org_id,
    stage_id,
    number AS stage_number,
    title AS stage,
    colour AS stage_colour,
    stage.id AS stage_history_id,
    stage.time_created AS stage_history_time_created,
    stage.is_current AS stage_is_current,
    status.id AS status_history_id,
    status.status,
    status.time_created AS status_history_time_created,
    status.is_current AS status_is_current,
    application.outcome
FROM
    application_stage_history stage
    FULL OUTER JOIN application_status_history status ON stage.id = status.application_stage_history_id
JOIN template_stage ts ON stage.stage_id = ts.id
JOIN TEMPLATE ON ts.template_id = template.id
JOIN application ON stage.application_id = application.id;

-- As above, but only with the CURRENT stage/status
CREATE OR REPLACE VIEW application_stage_status_latest AS
SELECT
    *
FROM
    application_stage_status_all
WHERE
    stage_is_current = TRUE
    AND status_is_current = TRUE;

-- Function to expose stage_number field on application table in GraphQL
CREATE FUNCTION public.application_stage_number (app public.application)
    RETURNS int
    AS $$
    SELECT
        stage_number
    FROM (
        SELECT
            application_id,
            stage_number
        FROM
            public.application_stage_status_latest) AS app_stage_num
WHERE
    app_stage_num.application_id = app.id;

$$
LANGUAGE sql
STABLE;

-- Function to expose stage name field on application table in GraphQL
CREATE FUNCTION public.application_stage (app public.application)
    RETURNS varchar
    AS $$
    SELECT
        stage
    FROM (
        SELECT
            application_id,
            stage
        FROM
            public.application_stage_status_latest) AS app_stage
WHERE
    app_stage.application_id = app.id;

$$
LANGUAGE sql
STABLE;

-- Function to expose status field on application table in GraphQL
CREATE FUNCTION public.application_status (a public.application)
    RETURNS application_status
    AS $$
    SELECT
        status
    FROM (
        SELECT
            application_id,
            status
        FROM
            public.application_stage_status_latest) AS app_status
WHERE
    app_status.application_id = a.id;

$$
LANGUAGE sql
STABLE;

