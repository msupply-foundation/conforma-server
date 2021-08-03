-- application status history
CREATE TYPE public.application_status AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'CHANGES_REQUIRED',
  'RE_SUBMITTED',
  'COMPLETED'
);

CREATE TABLE public.application_status_history (
  id serial PRIMARY KEY,
  application_stage_history_id integer REFERENCES public.application_stage_history (id),
  status public.application_status,
  time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
  is_current bool DEFAULT TRUE
);

-- FUNCTION to auto-add application_id to application_status_history table
CREATE OR REPLACE FUNCTION public.application_status_history_application_id (application_stage_history_id int)
  RETURNS int
  AS $$
  SELECT
    application_id
  FROM
    application_stage_history
  WHERE
    id = $1;

$$
LANGUAGE SQL
IMMUTABLE;

ALTER TABLE application_status_history
  ADD application_id INT GENERATED ALWAYS AS (application_status_history_application_id (application_stage_history_id)) STORED;

-- FUNCTION to set `is_current` to false on all other status_histories of current application
CREATE OR REPLACE FUNCTION public.status_is_current_update ()
  RETURNS TRIGGER
  AS $application_status_history_event$
BEGIN
  UPDATE
    public.application_status_history
  SET
    is_current = FALSE
  WHERE
    application_id = NEW.application_id
    AND id <> NEW.id;
  RETURN NULL;
END;
$application_status_history_event$
LANGUAGE plpgsql;

--TRIGGER to run above function when is_current is updated
CREATE TRIGGER application_status_history_trigger
  AFTER INSERT OR UPDATE OF is_current ON public.application_status_history
  FOR EACH ROW
  WHEN (NEW.is_current = TRUE)
  EXECUTE FUNCTION public.status_is_current_update ()
