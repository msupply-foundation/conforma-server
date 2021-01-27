-- review response

CREATE TYPE public.review_response_decision as ENUM ('Approve', 'Decline');

CREATE TYPE public.review_response_status as ENUM ('Draft', 'Submitted');

CREATE TABLE public.review_response (
	id serial primary key,
	comment varchar,
	review_response_decision public.review_response_decision,
	review_question_assignment_id integer references public.review_question_assignment(id),
	application_response_id integer references public.application_response(id),
	review_response_id integer references public.review_response(id),
	review_id integer references public.review(id),
    "timestamp" timestamp with time zone default current_timestamp,
	"status" public.review_response_status
);