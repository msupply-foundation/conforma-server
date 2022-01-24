-- review question assignment
CREATE TABLE public.review_question_assignment (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id) ON DELETE CASCADE NOT NULL,
    review_assignment_id integer REFERENCES public.review_assignment (id) ON DELETE CASCADE NOT NULL
);

-- So we know what Section review assignments relate to:
CREATE OR REPLACE VIEW review_question_assignment_section AS (
    SELECT
        rqa.id,
        template_element_id,
        review_assignment_id,
        section_id AS template_section_id
    FROM
        public.review_question_assignment rqa
        JOIN template_element ON template_element_id = template_element.id);

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
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
    AND template_element.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

