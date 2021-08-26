-- review question assignment
CREATE TABLE public.review_question_assignment (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id) ON DELETE CASCADE NOT NULL,
    review_assignment_id integer REFERENCES public.review_assignment (id) ON DELETE CASCADE NOT NULL
);

-- Function to return count of assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count (app_id int, stage_id int, level int)
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
    ra.application_id = $1
    AND ra.stage_id = $2
    AND ra.level_number = $3 -- currently restrict partial assignment to level 1
    AND ra.status = 'ASSIGNED'
    AND template_element.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

-- Function to return count of template questions for a given application/template
CREATE FUNCTION public.template_questions_count (app_id int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        application app
        JOIN template ON app.template_id = template.id
        JOIN template_section ON template.id = template_section.template_id
        JOIN template_element ON template_section.id = template_element.section_id
    WHERE
        app.id = $1
        -- TODO: Add check for template version
        AND template_section.template_id = app.template_id
        AND template_element.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

