-- review

CREATE TYPE public.review_status AS ENUM ('Awaiting review', 'In Progress', 'Ready', 'Approvable', 'Non-Approvable');

CREATE TABLE public.review (
	id serial primary key,
	application_id integer references public.application(id),
	status public.review_status,
	comment varchar,
	time_created timestamp,
	trigger public.trigger
);

-- TRIGGER (Listener) on Review table
CREATE TRIGGER review_trigger AFTER INSERT OR UPDATE OF trigger ON public.review
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'Processing')
EXECUTE FUNCTION public.add_event_to_trigger_queue();