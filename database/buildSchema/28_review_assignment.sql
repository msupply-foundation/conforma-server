-- review assignment

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
    template_id integer GENERATED ALWAYS AS (public.review_assignment_template_id (application_id)) STORED REFERENCES public.template (id) ON DELETE CASCADE,
    allowed_sections varchar[] DEFAULT NULL,
    assigned_sections varchar[] DEFAULT array[]::varchar[] NOT NULL,
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

-- FUNCTION
CREATE OR REPLACE FUNCTION public.empty_assigned_sections ()
    RETURNS TRIGGER
        AS $review_assignment_event$
    BEGIN
        UPDATE
            public.review_assignment
        SET
            assigned_sections = '{}'
        WHERE
            id = NEW.id;
        RETURN NULL;
    END;
$review_assignment_event$
LANGUAGE plpgsql;

-- TRIGGER (Listener) on review_assignment table: To update trigger
CREATE TRIGGER review_assignment_trigger
    AFTER INSERT OR UPDATE OF trigger ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.trigger IS NOT NULL AND NEW.trigger <> 'PROCESSING' AND NEW.trigger <> 'ERROR')
    EXECUTE FUNCTION public.add_event_to_trigger_queue ();

-- TRIGGER (Listener) on review_assignment table: Set assignedSections to Null when changing status to AVAILABLE
CREATE TRIGGER review_assignment_trigger2
    AFTER UPDATE OF trigger ON public.review_assignment
    FOR EACH ROW
    WHEN (NEW.status = 'AVAILABLE')
    EXECUTE FUNCTION public.empty_assigned_sections ();

CREATE UNIQUE INDEX unique_review_assignment_with_org ON review_assignment (reviewer_id, organisation_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_review_assignment_no_org ON review_assignment (reviewer_id, stage_number, application_id, level_number)
WHERE
    organisation_id IS NULL;

