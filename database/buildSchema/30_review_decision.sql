-- review decision
CREATE TYPE public.decision AS ENUM (
    'List Of Questions',
    'Conform',
    'Non-conform',
    'Changes Requested',
    'No Decision'
);

CREATE TABLE public.review_decision (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id),
    decision public.decision,
    comment varchar,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP
);

