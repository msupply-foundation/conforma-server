-- FUNCTION to auto-add template_id to review_assignment
CREATE OR REPLACE FUNCTION public.review_assignment_template_id (application_id int)
    RETURNS int
    AS $$
    SELECT
        template_id
    FROM
        application
    WHERE
        id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

-- review assignment
CREATE TYPE public.review_assignment_status AS ENUM (
    'AVAILABLE',
    'SELF_ASSIGNED_BY_ANOTHER',
    'ASSIGNED',
    'AVAILABLE_FOR_SELF_ASSIGNMENT'
);

CREATE TABLE public.review_assignment (
    id serial PRIMARY KEY,
    assigner_id integer REFERENCES public.user (id),
    reviewer_id integer REFERENCES public.user (id),
    organisation_id integer REFERENCES public.organisation (id),
    stage_id integer REFERENCES public.template_stage (id),
    stage_number integer,
    status public.review_assignment_status NOT NULL,
    application_id integer REFERENCES public.application (id),
    template_id integer GENERATED ALWAYS AS (public.review_assignment_template_id (application_id)) STORED REFERENCES public.template (id),
    allowed_sections varchar[] DEFAULT NULL,
    TRIGGER public.trigger,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    level_number integer,
    level_id integer REFERENCES public.template_stage_review_level (id),
    is_last_level boolean,
    is_locked boolean DEFAULT false
);

-- TRIGGER (Listener) on review_assignment table
CREATE TRIGGER review_assignment_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

CREATE UNIQUE INDEX unique_review_assignment_with_org ON review_assignment (reviewer_id, organisation_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_review_assignment_no_org ON review_assignment (reviewer_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NULL;

