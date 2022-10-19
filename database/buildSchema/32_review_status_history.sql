-- review status history
CREATE TYPE public.review_status AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'CHANGES_REQUESTED',
    'PENDING',
    'LOCKED',
    'DISCONTINUED'
);

CREATE TABLE public.review_status_history (
    id serial PRIMARY KEY,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE NOT NULL,
    status public.review_status,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    is_current boolean DEFAULT TRUE
);

