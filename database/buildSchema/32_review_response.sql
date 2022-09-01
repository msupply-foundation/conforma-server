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
    is_latest_review_submission boolean DEFAULT FALSE,
    template_element_id integer REFERENCES public.template_element ON DELETE CASCADE,
    recommended_applicant_visibility public.review_response_recommended_applicant_visibility DEFAULT 'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT',
    status public.review_response_status DEFAULT 'DRAFT'
);

-- Function to automatically set previous review_responses 
-- (for same review & templateElement) as is_latest_review_submitted = false
CREATE OR REPLACE FUNCTION public.set_previous_review_response ()
    RETURNS TRIGGER
    AS $review_response_event$
BEGIN
    UPDATE
        public.review_response
    SET
        is_latest_review_submission = FALSE
    WHERE
        template_element_id = NEW.template_element_id
        AND review_id = NEW.review_id;
    RETURN NULL;
END;
$review_response_event$
LANGUAGE plpgsql;

-- TRIGGER (Listener) on review_response table: Run set_previous_review_response
CREATE TRIGGER review_response_trigger
    AFTER INSERT ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION public.set_previous_review_response ();

-- Function to automatically update "time_updated"
CREATE OR REPLACE FUNCTION public.update_review_response_timestamp ()
    RETURNS TRIGGER
    AS $application_event$
BEGIN
    UPDATE
        public.review_response
    SET
        time_updated = NOW()
    WHERE
        id = NEW.id;
    RETURN NULL;
END;
$application_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when response is updated
CREATE TRIGGER review_response_timestamp_trigger
    AFTER UPDATE OF comment,
    decision ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION public.update_review_response_timestamp ();

-- set review response original_review_response_id (the response that links to application id should be available for all responses)
-- also flatten out review response chain by providing template_element_id in review_response and application_response_id
CREATE OR REPLACE FUNCTION set_original_response ()
    RETURNS TRIGGER
    AS $$
BEGIN
    IF NEW.review_response_link_id IS NOT NULL THEN
        NEW.original_review_response_id = (
            SELECT
                original_review_response_id
            FROM
                review_response
            WHERE
                id = NEW.review_response_link_id);
        NEW.application_response_id = (
            SELECT
                application_response_id
            FROM
                review_response
            WHERE
                id = NEW.review_response_link_id);
    ELSE
        -- should always be original review_response when review_response_link_id IS NULL
        NEW.original_review_response_id = NEW.id;
    END IF;
    -- application_response should always exist
    NEW.template_element_id = (
        SELECT
            template_element_id
        FROM
            application_response
        WHERE
            id = NEW.application_response_id);
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER set_original_response_trigger
    BEFORE INSERT ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION set_original_response ();

