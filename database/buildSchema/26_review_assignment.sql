-- review assignment

CREATE TYPE public.review_assignment_status as ENUM ('Available', 'Not available', 'Assigned', 'Available for self assignment'); 

CREATE TABLE public.review_assignment (
	id serial primary key,
	assigner_id integer references public.user(id),
	reviewer_id integer references public.user(id),
	stage_id integer references public.template_stage(id),
	status public.review_assignment_status,
	application_id integer references public.application(id),
	allowed_template_section_ids integer [],
	trigger public.trigger,
	time_created timestamptz default current_timestamp,
	level integer,
	is_last_level boolean
);

-- TRIGGER (Listener) on review_assignment table
CREATE TRIGGER review_assignment_trigger AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
FOR EACH ROW
WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'Processing' AND NEW.trigger <> 'Error')
EXECUTE FUNCTION public.add_event_to_trigger_queue();


-- Function to return count of assigned questions for current stage/level
CREATE FUNCTION public.assigned_questions_count(curr_ra public.review_assignment)
RETURNS bigint AS $$
	SELECT COUNT(DISTINCT(template_element.id)) FROM
	review_question_assignment rqa JOIN review_assignment ra
		ON rqa.review_assignment_id = ra.id JOIN
	template_element ON template_element.id = rqa.template_element_id
	WHERE
		ra.status = 'Assigned'
		AND ra.stage_id = curr_ra.stage_id
		AND ra.level = curr_ra.level
		AND ra.application_id = curr_ra.application_id
		AND template_element.category = 'Question'
$$ LANGUAGE sql STABLE;
