-- review section join


CREATE TYPE public.review_status as ENUM ('Draft', 'Submitted', 'Changes Required', 'Review Pending');

CREATE TABLE public.review_status_history (
	id serial primary key,
	review_id integer references public.review(id),
	"status" public.review_status,
	"timestamp" timestamp with time zone default current_timestamp,
	is_current boolean DEFAULT true
);

-- FUNCTION to set `is_current` to false on all other review_status_histories of current review
CREATE OR REPLACE FUNCTION public.review_status_history_is_current_update()
RETURNS trigger as $review_status_history_event$
BEGIN
	UPDATE public.review_status_history SET is_current = false
	WHERE review_id = NEW.review_id AND id<>NEW.id;
RETURN NULL;
END;
$review_status_history_event$
LANGUAGE plpgsql;


--TRIGGER to run above function when is_current is updated
CREATE TRIGGER review_status_history_trigger AFTER INSERT OR UPDATE OF is_current ON public.review_status_history
FOR EACH ROW
WHEN (NEW.is_current = true)
EXECUTE FUNCTION public.review_status_history_is_current_update();

-- Function to expose status name field on review table in GraphQL
CREATE FUNCTION public.review_status(app public.review)
RETURNS VARCHAR AS $$
	SELECT "status"::VARCHAR FROM review_status_history 
	WHERE review_id = app.id and is_current = true
$$ LANGUAGE sql STABLE;
