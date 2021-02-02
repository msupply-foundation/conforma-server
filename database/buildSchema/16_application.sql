-- application 

CREATE TYPE public.application_outcome AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TABLE public.application (
    id serial primary key,
    template_id integer references public.template(id),
    user_id integer references public.user(id),
    org_id integer references public.organisation(id),
	serial varchar UNIQUE,
    name varchar,
    outcome public.application_outcome,
    is_active bool,
    trigger public.trigger
);


--FUNCTION to update `is_active` to false
CREATE OR REPLACE FUNCTION public.outcome_changed()
RETURNS trigger as $application_event$
BEGIN
	UPDATE public.application SET is_active = false WHERE id = NEW.id;
RETURN NULL;
END;
$application_event$ LANGUAGE plpgsql;


--TRIGGER to run above function when outcome is updated
CREATE TRIGGER outcome_trigger AFTER INSERT OR UPDATE OF outcome ON public.application
FOR EACH ROW
WHEN (NEW.outcome = 'Approved' OR NEW.outcome = 'Rejected')
EXECUTE FUNCTION public.outcome_changed()

