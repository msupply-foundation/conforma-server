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

