-- review response

CREATE TABLE public.review_response (
	id serial primary key,
	application_response_id integer references public.application_response(id),
	decision public.review_decision,
	comment varchar,
	trigger public.trigger
);

-- TRIGGER (Listener) on Review_response table
CREATE TRIGGER review_response_trigger AFTER INSERT OR UPDATE OF trigger ON public.review_response
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL)
EXECUTE FUNCTION public.add_event_to_trigger_queue();