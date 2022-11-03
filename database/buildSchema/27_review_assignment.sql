-- review assignment
--
-- ENUM
CREATE TYPE public.review_assignment_status AS ENUM (
    'AVAILABLE',
    'ASSIGNED'
);

CREATE TABLE public.review_assignment (
    id serial PRIMARY KEY,
    assigner_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    reviewer_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    stage_id integer REFERENCES public.template_stage (id) ON DELETE CASCADE NOT NULL,
    stage_number integer,
    time_stage_created timestamptz,
    status public.review_assignment_status NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    -- template_id -- added later after generating function created
    allowed_sections varchar[] DEFAULT NULL,
    assigned_sections varchar[] DEFAULT ARRAY[] ::varchar[] NOT NULL,
    TRIGGER public.trigger,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    level_number integer,
    level_id integer REFERENCES public.template_stage_review_level (id) ON DELETE CASCADE,
    is_last_level boolean,
    is_last_stage boolean,
    is_locked boolean DEFAULT FALSE,
    is_final_decision boolean DEFAULT FALSE,
    is_self_assignable boolean DEFAULT FALSE
);

CREATE UNIQUE INDEX unique_review_assignment_with_org ON review_assignment (reviewer_id, organisation_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_review_assignment_no_org ON review_assignment (reviewer_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NULL;

