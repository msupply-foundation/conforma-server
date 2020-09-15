-- review section response join

CREATE TABLE public.review_section_response_join (
	id serial primary key,
	review_section_join_id integer references public.review_section_join(id),
	review_response_id integer references public.review_response(id),
	send_to_applicant boolean
);