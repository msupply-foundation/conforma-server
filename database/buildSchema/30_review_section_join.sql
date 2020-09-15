-- review section join

CREATE TABLE public.review_section_join (
	id serial primary key,
	review_id integer references public.review(id),
	section_assignment_id integer references public.review_section_assignment(id),
	review_section_id integer references public.review_section(id),
	send_to_applicant boolean
);