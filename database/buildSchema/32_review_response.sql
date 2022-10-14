-- review response
CREATE TYPE public.review_response_decision AS ENUM (
    'APPROVE',
    'DECLINE',
    'AGREE',
    'DISAGREE'
);

CREATE TYPE public.review_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);

CREATE TYPE public.review_response_recommended_applicant_visibility AS ENUM (
    'ORIGINAL_RESPONSE_VISIBLE_TO_APPLICANT',
    'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT'
);

CREATE TABLE public.review_response (
    id serial PRIMARY KEY,
    comment varchar,
    decision public.review_response_decision,
    application_response_id integer REFERENCES public.application_response (id) ON DELETE CASCADE,
    review_response_link_id integer REFERENCES public.review_response (id) ON DELETE CASCADE,
    original_review_response_id integer REFERENCES public.review_response (id) ON DELETE CASCADE,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE,
    stage_number integer DEFAULT NULL,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamptz,
    is_visible_to_applicant boolean DEFAULT FALSE,
    is_latest_review boolean DEFAULT FALSE,
    template_element_id integer REFERENCES public.template_element ON DELETE CASCADE,
    recommended_applicant_visibility public.review_response_recommended_applicant_visibility DEFAULT 'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT',
    status public.review_response_status DEFAULT 'DRAFT'
);

