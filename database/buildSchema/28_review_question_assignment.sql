-- review question assignment

CREATE TABLE public.review_question_assignment (
	id serial primary key,
	template_element_id integer references public.template_element(id),
	review_assignment_id integer references public.review_assignment(id)
);


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
		AND ra.level = 1 -- currently restrict partial assignment to level 1
		AND ra.application_id = curr_ra.application_id
		AND template_element.category = 'Question'
$$ LANGUAGE sql STABLE;

-- Function to return count of template questions for a given application/template
CREATE FUNCTION public.template_question_count(application_id int)
RETURNS bigint AS $$
	SELECT COUNT(*)
		FROM application JOIN template ON application.template_id = template.id
		JOIN template_section ON template_section.template_id = template.id
		JOIN template_element ON template_element.section_id = template_section.id
	WHERE
		application.id = application_id
		AND template_element.category = 'Question'
$$ LANGUAGE sql STABLE;