-- FUNCTION to auto-add application_id to review
CREATE or replace FUNCTION public.review_application_id(review_assignment_id int)
RETURNS INT AS $$
select application_id from review_assignment where id = $1 ;
$$ LANGUAGE SQL IMMUTABLE;

-- FUNCTION to auto-add reviewer_id to review
CREATE or replace FUNCTION public.review_reviewer_id(review_assignment_id int)
RETURNS INT AS $$
select reviewer_id from review_assignment where id = $1 ;
$$ LANGUAGE SQL IMMUTABLE;

-- review
CREATE TABLE public.review (
	id serial primary key,
	review_assignment_id integer references public.review_assignment(id),
	-- status via review_status_history
	trigger public.trigger,
	application_id integer GENERATED ALWAYS AS (public.review_application_id(review_assignment_id)) STORED references public.application(id),
	reviewer_id integer GENERATED ALWAYS AS (public.review_reviewer_id(review_assignment_id)) STORED references public.user(id),
	level integer,
	can_make_overall_decision boolean
);

-- TRIGGER (Listener) on review table
CREATE TRIGGER review_trigger AFTER INSERT OR UPDATE OF trigger ON public.review
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'Processing' AND NEW.trigger <> 'Error')
EXECUTE FUNCTION public.add_event_to_trigger_queue();