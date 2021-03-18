-- review assignment assigner join

CREATE TABLE public.review_assignment_assigner_join (
	id serial PRIMARY KEY,
	assigner_id integer REFERENCES public.user(id),
	organisation_id integer REFERENCES public.organisation (id),
	review_assignment_id integer REFERENCES public.review_assignment(id)
);



