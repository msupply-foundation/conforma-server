-- review status history
CREATE TYPE public.review_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'CHANGES_REQUESTED',
    'PENDING',
    'LOCKED'
);

CREATE TABLE public.review_status_history (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE NOT NULL,
    status public.review_status,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    is_current boolean DEFAULT TRUE
);

-- FUNCTION to set `is_current` to false on all other review_status_histories of current review
CREATE OR REPLACE FUNCTION public.review_status_history_is_current_update ()
    RETURNS TRIGGER
    AS $review_status_history_event$
BEGIN
    UPDATE
        public.review_status_history
    SET
        is_current = FALSE
    WHERE
        review_id = NEW.review_id
        AND id <> NEW.id;
    RETURN NULL;
END;
$review_status_history_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when is_current is updated
CREATE TRIGGER review_status_history_trigger
    AFTER INSERT OR UPDATE OF is_current ON public.review_status_history
    FOR EACH ROW
    WHEN (NEW.is_current = TRUE)
    EXECUTE FUNCTION public.review_status_history_is_current_update ();

-- Function to expose status name field on review table in GraphQL
CREATE FUNCTION public.review_status (app public.review)
    RETURNS public.review_status
    AS $$
    SELECT
        "status"
    FROM
        review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$
LANGUAGE sql
STABLE;

-- Function to expose time_status_created field on review table in GraphQL
CREATE FUNCTION public.review_time_status_created (app public.review)
    RETURNS timestamptz
    AS $$
    SELECT
        time_created
    FROM
        review_status_history
    WHERE
        review_id = app.id
        AND is_current = TRUE
$$
LANGUAGE sql
STABLE;

-- Function to return count of application assignable questions for given application
CREATE FUNCTION public.assignable_questions_count (app_id int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(*)
    FROM
        application_response ar
        JOIN application app ON ar.application_id = app.id
        JOIN template_element te ON ar.template_element_id = te.id
    WHERE
        ar.application_id = $1
        AND te.category = 'QUESTION'
$$
LANGUAGE sql
STABLE;

-- Function to return count of assigned questions that can't be re-assigned (review has been submitted)
CREATE FUNCTION public.submitted_assigned_questions_count (app_id int, stage_number int, level_number int)
    RETURNS bigint
    AS $$
    SELECT
        COUNT(DISTINCT (rqa.template_element_id))
    FROM
        review
    LEFT JOIN review_assignment ra ON review.review_assignment_id = ra.id
    LEFT JOIN review_question_assignment rqa ON ra.id = rqa.review_assignment_id
    LEFT JOIN review_status_history rsh ON review.id = rsh.review_id
WHERE
    ra.application_id = $1
    AND ra.stage_number = $2
    AND ra.level_number = $3
    AND ra.status = 'ASSIGNED'
    AND rsh.status = 'SUBMITTED'
$$
LANGUAGE sql
STABLE;