-- Function to return elements reviewable questions (per application)
CREATE OR REPLACE FUNCTION public.reviewable_questions (app_id int)
    RETURNS TABLE (
        code varchar,
        response_id int,
        is_reviewable public.is_reviewable_status,
        response_value jsonb,
        is_optional boolean
    )
    AS $$
    SELECT DISTINCT ON (code)
        te.code AS code,
        ar.id AS response_id,
        te.is_reviewable AS is_reviewable,
        ar.value AS response_value,
        CASE WHEN ar.value IS NULL
            AND te.is_reviewable = 'OPTIONAL_IF_NO_RESPONSE' THEN
            TRUE
        ELSE
            FALSE
        END::boolean
    FROM
        application_response ar
        JOIN application app ON ar.application_id = app.id
        JOIN template_element te ON ar.template_element_id = te.id
    WHERE
        ar.application_id = $1
        AND te.category = 'QUESTION'
        AND ((ar.value IS NULL
                AND te.is_reviewable = 'OPTIONAL_IF_NO_RESPONSE')
            OR (ar.value IS NOT NULL
                AND te.is_reviewable != 'NEVER'))
    GROUP BY
        te.code,
        ar.time_submitted,
        ar.id,
        te,
        is_reviewable,
        ar.value
    ORDER BY
        code,
        ar.time_submitted DESC
$$
LANGUAGE sql
STABLE;

-- Function to return elements of assigned questions for current stage/level
CREATE OR REPLACE FUNCTION public.assigned_questions (app_id int, stage_id int, level_number int)
    RETURNS TABLE (
        review_id int,
        response_id int,
        review_assignment_id int,
        review_response_code varchar,
        review_response_status public.review_response_status,
        decision public.review_response_decision,
        is_optional boolean
    )
    AS $$
    SELECT DISTINCT ON (review_response_code)
        rr.review_id,
        rq.response_id,
        ra.id AS review_assignment_id,
        rq.code AS review_response_code,
        rr.status AS review_response_status,
        rr.decision,
        rq.is_optional
    FROM (
        SELECT
            id,
            application_id,
            stage_id,
            level_number,
            status,
            UNNEST(assigned_sections) AS section_code
        FROM
            review_assignment) ra
    JOIN template_section ts ON ra.section_code = ts.code
    JOIN template_element te ON ts.id = te.section_id
    JOIN reviewable_questions (app_id) rq ON rq.code = te.code
    JOIN review_response rr ON rr.application_response_id = rq.response_id
WHERE
    ra.application_id = $1
    AND ra.stage_id = $2
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
GROUP BY
    ra.id,
    rr.review_id,
    rr.is_latest_review,
    rq.is_optional,
    rr.status,
    rr.decision,
    rq.code,
    rq.response_id
ORDER BY
    review_response_code,
    is_latest_review DESC
$$
LANGUAGE sql
STABLE;

-- Function to return TOTAL of reviewable questions (per application)
CREATE FUNCTION public.reviewable_questions_count (app_id int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        reviewable_questions (app_id)
$$
LANGUAGE sql
STABLE;

-- Function to return TOTAL assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level_number int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        assigned_questions (app_id, stage_id, level_number)
$$
LANGUAGE sql
STABLE;

-- Function to return TOTAL of assigned and submitted (element that can't be re-assigned)
CREATE FUNCTION public.submitted_assigned_questions_count (app_id int, stage_id int, level_number int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        assigned_questions (app_id, stage_id, level_number) aq
WHERE
    aq.review_response_status = 'SUBMITTED'
$$
LANGUAGE sql
STABLE;

