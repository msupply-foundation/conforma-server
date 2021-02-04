-- review response

CREATE TYPE public.review_response_decision as ENUM ('Approve', 'Decline');

CREATE TYPE public.review_response_status as ENUM ('Draft', 'Submitted');

CREATE TABLE public.review_response (
	id serial primary key,
	comment varchar,
	decision public.review_response_decision,
	review_question_assignment_id integer references public.review_question_assignment(id),
	application_response_id integer references public.application_response(id),
	review_response_link_id integer references public.review_response(id),
	review_id integer references public.review(id),
    time_created timestamptz default current_timestamp,
	status public.review_response_status default 'Draft'
);