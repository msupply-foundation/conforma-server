-- review question assignment

CREATE TABLE public.review_question_assignment (
	id serial primary key,
	template_element_id integer references public.template_element(id),
	review_assignment_id integer references public.review_assignment(id)
);
