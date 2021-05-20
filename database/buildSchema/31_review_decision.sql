-- review decision
CREATE TYPE public.decision AS ENUM (
    'List of questions', -- TODO: 'LIST_OF_QUESTIONS'
    'Conform', -- TODO: 'CONFORM'
    'Non-conform', -- TODO: 'NON_CONFORM'
    'CHANGES_REQUESTED', 
    'No Decision' -- TODO: 'NO_DECISION'
);

CREATE TABLE public.review_decision (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id),
    decision public.decision DEFAULT 'No Decision', -- TODO: 'NO_DECISION'
    comment varchar,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- exposes latest overall deicison for review
CREATE FUNCTION public.review_latest_decision (review public.review)
    RETURNS public.review_decision
    AS $$
    SELECT
        *
    FROM
        public.review_decision
    WHERE
        review_id = review.id
    ORDER BY
        time_updated DESC
    LIMIT 1
$$
LANGUAGE sql
STABLE;

