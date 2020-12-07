-- review assignment

CREATE TABLE public.review_assignment (
	id serial primary key,
	assigner_id integer references public.user(id),
	reviewer_id integer references public.user(id),
	stage_id integer references public.template_stage(id),
	application_id integer references public.application(id)
);
