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
    review_question_assignment_id integer REFERENCES public.review_question_assignment (id),
    application_response_id integer REFERENCES public.application_response (id),
    review_response_link_id integer REFERENCES public.review_response (id),
    original_review_response_id integer REFERENCES public.review_response (id),
    review_id integer REFERENCES public.review (id),
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamptz,
    is_visible_to_applicant boolean DEFAULT FALSE,
    template_element_id integer REFERENCES public.template_element,
    recommended_applicant_visibility public.review_response_recommended_applicant_visibility DEFAULT 'ORIGINAL_RESPONSE_NOT_VISIBLE_TO_APPLICANT',
    status public.review_response_status DEFAULT 'DRAFT'
);

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

-- set review response original_review_response_id (the response that links to application id should be available for all reaponses)
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
    -- review_question_assignment should always exist
    NEW.template_element_id = (
        SELECT
            template_element_id
        FROM
            review_question_assignment
        WHERE
            id = NEW.review_question_assignment_id);
    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

CREATE TRIGGER set_original_response_trigger
    BEFORE INSERT ON public.review_response
    FOR EACH ROW
    EXECUTE FUNCTION set_original_response ()
