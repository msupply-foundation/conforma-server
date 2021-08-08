-- (application) template table
CREATE TYPE public.template_status AS ENUM (
    'DRAFT',
    'AVAILABLE',
    'DISABLED'
);

CREATE TABLE public.template (
    id serial PRIMARY KEY,
    name varchar,
    name_plural varchar,
    code varchar NOT NULL,
    is_linear boolean DEFAULT TRUE,
    start_message jsonb,
    status public.template_status,
    submission_message jsonb DEFAULT '"Thank you! Your application has been submitted."' ::jsonb,
    template_category_id integer REFERENCES public.template_category (id),
    version_timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 1
);

-- FUNCTION to generate a new version of template (should run as a trigger)
CREATE OR REPLACE FUNCTION public.set_template_verision ()
    RETURNS TRIGGER
    AS $template_event$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            TEMPLATE
        WHERE
            id != NEW.id AND code = NEW.code AND version = NEW.version) > 0 THEN
        NEW.version = (
            SELECT
                max(version) + 1
            FROM
                TEMPLATE
            WHERE
                code = NEW.code);
        NEW.version_timestamp = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END
$template_event$
LANGUAGE plpgsql;

-- FUNCTION to make sure duplicated templates have 'DRAFT' status
CREATE OR REPLACE FUNCTION public.set_template_to_draft ()
    RETURNS TRIGGER
    AS $template_event$
BEGIN
    IF (
        SELECT
            count(*)
        FROM
            TEMPLATE
        WHERE
            id != NEW.id AND code = NEW.code) > 0 THEN
        NEW.status = 'DRAFT';
    END IF;
    RETURN NEW;
END
$template_event$
LANGUAGE plpgsql;

--TRIGGER to generate new version of template on insertion or update
CREATE TRIGGER set_template_version_trigger
    BEFORE INSERT OR UPDATE ON public.template
    FOR EACH ROW
    EXECUTE FUNCTION public.set_template_verision ();

--TRIGGER to make sure duplicates templates have 'DRAFT' status
CREATE TRIGGER set_template_to_draft_trigger
    BEFORE INSERT ON public.template
    FOR EACH ROW
    EXECUTE FUNCTION public.set_template_to_draft ()
