-- review decision

CREATE TYPE public.decision as ENUM ('List of questions', 'Conform', 'Non-conform', 'Changes Requested');

CREATE TABLE public.review_decision (
	id serial primary key,
	review_id integer references public.review(id),
	decision public.decision,
	comment varchar,
    time_updated timestamptz default current_timestamp
);

-- exposes latest overall deicison for review
CREATE FUNCTION public.review_latest_decision(review public.review)
RETURNS public.review_decision AS $$
	SELECT * FROM public.review_decision
	WHERE review_id = review.id
	ORDER BY time_updated DESC
	LIMIT 1
$$ LANGUAGE sql STABLE;