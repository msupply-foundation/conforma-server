-- review assignment

CREATE TYPE public.review_assignment_status as ENUM ('Available', 'Not available', 'Assigned', 'Available for self assignment'); 

CREATE TABLE public.review_assignment (
	id serial primary key,
	assigner_id integer references public.user(id),
	reviewer_id integer references public.user(id),
	stage_id integer references public.template_stage(id),
	"status" public.review_assignment_status,
	application_id integer references public.application(id),
	available_sections_ids integer [],
	trigger public.trigger,
	"timestamp" timestamp with time zone default current_timestamp
);

-- TRIGGER (Listener) on review_assignment table
CREATE TRIGGER review_assignment_trigger AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'Processing' AND NEW.trigger <> 'Error')
EXECUTE FUNCTION public.add_event_to_trigger_queue();
