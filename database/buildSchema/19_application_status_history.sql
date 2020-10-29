-- application status history

CREATE TYPE public.application_status AS ENUM ('Draft', 'Withdrawn', 'Submitted', 'Changes Required', 'Re-submitted', 'Completed');

CREATE TABLE public.application_status_history (
    id serial primary key,
    application_stage_history_id integer references public.application_stage_history(id),
    status public.application_status,
    time_created timestamp with time zone,
    is_current bool DEFAULT true
);