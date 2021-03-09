-- review decision

CREATE TYPE public.decision as ENUM ('List of questions', 'Conform', 'Non-conform', 'Changes Requested', 'No Decision');

CREATE TABLE public.review_decision (
	id serial primary key,
	review_id integer references public.review(id),
	decision public.decision,
	comment varchar,
    time_created timestamptz default current_timestamp
);
