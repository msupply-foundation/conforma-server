-- Function to return count of assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(DISTINCT (te.id))
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
WHERE
    ra.application_id = $1
    AND ra.stage_id = $2
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
    AND te.category = 'QUESTION'
    AND te.template_code = (
        SELECT
            code
        FROM
            TEMPLATE
        WHERE
            id = (
                SELECT
                    template_id
                FROM
                    application
                WHERE
                    id = $1));

$$
LANGUAGE sql
STABLE;

