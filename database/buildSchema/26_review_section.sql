-- review section

CREATE TYPE public.review_decision AS ENUM ('Approved', 'Rejected', 'Observations');

CREATE TABLE public.review_section (
	id serial primary key,
	decision public.review_decision,
	comment varchar
);