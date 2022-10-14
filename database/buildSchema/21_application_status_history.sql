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
  application_stage_history_id integer REFERENCES public.application_stage_history (id) ON DELETE CASCADE NOT NULL,
  status public.application_status,
  time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
  is_current bool DEFAULT TRUE
);

