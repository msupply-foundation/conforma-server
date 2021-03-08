-- review response

CREATE TYPE public.review_response_decision as ENUM ('Approve', 'Decline', 'Agree', 'Disagree');

CREATE TYPE public.review_response_status as ENUM ('Draft', 'Submitted');

CREATE TYPE public.review_response_recommended_applicant_visibility as ENUM ('Original Response Visible to Applicant', 'Original Response Not Visible to Applicant');

CREATE TABLE public.review_response (
	id serial primary key,
	comment varchar,
	decision public.review_response_decision,
	review_question_assignment_id integer references public.review_question_assignment(id),
	application_response_id integer references public.application_response(id),
	review_response_link_id integer references public.review_response(id),
	original_response_id integer references public.review_response(id),
	review_id integer references public.review(id),
    time_created timestamptz default current_timestamp,
	is_visible_to_applicant boolean default false,
	template_element_id integer references public.template_element,
	recommended_applicant_visibility public.review_response_recommended_applicant_visibility default 'Original Response Not Visible to Applicant',
	status public.review_response_status default 'Draft'
);

-- set review response original_response_id (the response that links to application id should be available for all reaponses)
-- also flatten out review response chain by providing template_element_id in review_response

CREATE OR REPLACE FUNCTION set_original_response()
RETURNS trigger AS $$
BEGIN
	IF NEW.application_response_id IS NOT NULL THEN
	  NEW.original_response_id = NEW.id;
	  IF NEW.review_question_assignment_id IS NOT NULL THEN
	     NEW.template_element_id = (SELECT template_element_id FROM review_question_assignment where id = NEW.review_question_assignment_id);
	  END IF;
	END IF;
	IF NEW.review_response_link_id IS NOT NULL THEN
	   NEW.original_response_id = (SELECT original_response_id FROM review_response where id = NEW.review_response_link_id);
	   NEW.template_element_id = (SELECT template_element_id FROM review_response where id = NEW.review_response_link_id);
	END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_original_response_trigger BEFORE INSERT ON public.review_response
FOR EACH ROW
EXECUTE FUNCTION set_original_response()