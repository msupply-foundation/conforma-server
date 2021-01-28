-- review decision

CREATE TYPE public.decision as ENUM ('LOQ', 'Conform', 'No conform', 'Changes Requested');

CREATE TABLE public.review_decision (
	id serial primary key,
	review_id integer references public.review(id),
	decision public.decision,
	comment varchar,
    "timestamp" timestamp with time zone default current_timestamp
);