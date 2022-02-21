-- FUNCTION to auto-add template_section_code to review_assignment
CREATE OR REPLACE FUNCTION public.rqa_template_section_code (template_element_id int)
    RETURNS varchar
    AS $$
    SELECT
        code
    FROM
        template_section
    WHERE
        id = (
            SELECT
                section_id
            FROM
                template_element
            WHERE
                id = $1);

$$
LANGUAGE SQL
IMMUTABLE;

-- review question assignment
CREATE TABLE public.review_question_assignment (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id) ON DELETE CASCADE NOT NULL,
    review_assignment_id integer REFERENCES public.review_assignment (id) ON DELETE CASCADE NOT NULL,
    section_code varchar GENERATED ALWAYS AS (public.rqa_template_section_code (template_element_id)) STORED
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

-- FUNCTION to delete unassigned review_question_assignments
CREATE OR REPLACE FUNCTION public.delete_question_assignments ()
    RETURNS TRIGGER
    AS $review_question_assignment_event$
BEGIN
    IF NEW.assigned_sections <> '{}' THEN
        DELETE FROM public.review_question_assignment
        WHERE review_assignment_id = NEW.id
            AND NOT section_code = ANY (ARRAY ((
                        SELECT
                            assigned_sections
                        FROM
                            review_assignment ra
                        WHERE
                            id = NEW.id)));
        ELSEIF NEW.status = 'AVAILABLE' THEN
        DELETE FROM public.review_question_assignment
        WHERE review_assignment_id = NEW.id;
    END IF;
    RETURN NULL;
    -- Case when assigned sections empty handled by review_assignment trigger
    -- as this query doesn't work with empty arrays!
END;
$review_question_assignment_event$
LANGUAGE plpgsql;

-- TRIGGER to execute the above Function whenever review_assignments are modified
CREATE TRIGGER review_question_assignment_trigger
    AFTER UPDATE OF assigned_sections ON public.review_assignment
    FOR EACH ROW
    EXECUTE FUNCTION public.delete_question_assignments ();

