-- review question assignment
CREATE TABLE public.review_question_assignment (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id),
    review_assignment_id integer REFERENCES public.review_assignment (id)
);

-- Function to check if application is fully assigned by counting number of 
--  assigned questions vs. template questions for current stage/level
CREATE FUNCTION public.is_fully_assigned_level (stage_id int, level int)
    RETURNS TABLE (
        application_id int,
        is_fully_assigned boolean,
        assigned_questions bigint,
        total_questions bigint
    )
    AS $$
    SELECT
        ra.application_id AS application_id,
        CASE
            WHEN 
                -- assigned_questions
                COUNT(DISTINCT (assigned_review_question.id)) = 
                -- total_questions
                COUNT(template_question) FILTER (WHERE template_question.category = 'QUESTION')
                THEN true
            ELSE false
        END AS is_fully_assigned,
        COUNT(DISTINCT (assigned_review_question.id)) AS assigned_questions,
        COUNT(template_question) FILTER (WHERE template_question.category = 'QUESTION') AS total_questions
    FROM
        review_question_assignment rqa
        JOIN review_assignment ra ON rqa.review_assignment_id = ra.id
        JOIN template_element AS assigned_review_question ON assigned_review_question.id = rqa.template_element_id
        JOIN application ON application.id = ra.application_id 
        LEFT JOIN template_section ON template_section.template_id = application.template_id
        LEFT JOIN template_element AS template_question ON template_question.section_id = template_section.id
    WHERE
        ra.status = 'ASSIGNED'
        AND ra.stage_id = stage_id
        AND ra.level_number = level -- currently restrict partial assignment to level 1
    GROUP BY
        ra.application_id;
$$
LANGUAGE sql
STABLE;