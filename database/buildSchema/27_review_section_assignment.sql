-- review section assignment

CREATE TABLE public.review_section_assignment (
	id serial primary key,
	reviewer_id integer references public.user(id),
	assigner_id integer references public.user(id),
	stage_id integer references public.application_stage_history(id),
	section_id integer references public.application_section(id),
	level varchar -- THIS NEEDS SORTING
);

-- NOTE: We haven't fully sorted how the review levels are going to work.