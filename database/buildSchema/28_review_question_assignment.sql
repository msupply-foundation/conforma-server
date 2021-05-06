-- review question assignment
CREATE TABLE public.review_question_assignment (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id),
    review_assignment_id integer REFERENCES public.review_assignment (id)
);

-- Function to return count of assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count (app application, stage_id int, level int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(DISTINCT (template_element.id))
    FROM
        review_question_assignment rqa
        JOIN review_assignment ra ON rqa.review_assignment_id = ra.id
        JOIN template_element ON template_element.id = rqa.template_element_id
    WHERE
        ra.status = 'Assigned'
        AND ra.stage_id = stage_id
        AND ra.level_number = level -- currently restrict partial assignment to level 1
        AND ra.application_id = app.id
        AND template_element.category = 'Question'
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
        AND template_element.category = 'Question'
$$
LANGUAGE sql
STABLE;

