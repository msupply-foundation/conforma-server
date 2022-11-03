-- review decision
CREATE TYPE public.decision AS ENUM (
    'LIST_OF_QUESTIONS',
    'CONFORM',
    'NON_CONFORM',
    'CHANGES_REQUESTED',
    'NO_DECISION'
);

CREATE TABLE public.review_decision (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE NOT NULL,
    decision public.decision DEFAULT 'NO_DECISION',
    comment varchar,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP
);

