-- review is fully assigned list

-- Function to return count of assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count (app application, stage_id int, level int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(DISTINCT (template_element.id))
    FROM
        -- LEFT JOIN TEMPLATE ON app.template_id = template.id
        -- LEFT JOIN review ON app.id = review.application_id
        review_assignment ra
        LEFT JOIN review_question_assignment rqa ON ra.id = rqa.review_assignment_id
        LEFT JOIN template_element ON rqa.template_element_id = template_element.id
    WHERE
        ra.application_id = app.id
        AND ra.stage_id = $2
        AND ra.level_number = $3 -- currently restrict partial assignment to level 1
        AND ra.status = 'ASSIGNED'
        AND template_element.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

-- Function to return count of template questions for a given application/template
CREATE FUNCTION public.template_questions_count (app application)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        template_section
        JOIN template_element ON template_element.section_id = template_section.id
    WHERE
        template_section.template_id = app.template_id
        AND template_element.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

-- Function to check if application is fully assigned by counting number of 
--  assigned questions vs. template questions for current stage/level
CREATE FUNCTION public.review_is_fully_assigned_list (stage_id int, level int)
    RETURNS TABLE (
        application_id int,
        is_fully_assigned boolean,
        assigned_questions bigint,
        total_questions bigint
    )
    AS $$
    SELECT
        app.id AS application_id,
        CASE
            WHEN assigned_questions_count(app, $1, $2) = template_questions_count(app)
                THEN true
            ELSE false
        END AS is_fully_assigned,
        assigned_questions_count(app, $1, $2) AS assigned_questions,
        template_questions_count(app) AS total_questions
    FROM
        application app
$$
LANGUAGE sql
STABLE;