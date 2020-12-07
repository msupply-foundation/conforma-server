-- review response

CREATE TYPE public.review_response_decision as ENUM ('Approve', 'Decline');

CREATE TABLE public.review_response (
	id serial primary key,
	comment varchar,
	decision public.review_response_decision,
	review_question_assignment_id integer references public.review_question_assignment(id),
	application_response_id integer references public.application_response(id),
	review_id integer references public.review(id),
    "timestamp" timestamp with time zone
);