-- action queue
CREATE TYPE public.action_queue_status AS ENUM (
    'QUEUED',
    'PROCESSING',
    'SUCCESS',
    'FAIL',
    'CONDITION_NOT_MET'
);

CREATE TABLE public.action_queue (
    id serial PRIMARY KEY,
    trigger_event integer REFERENCES public.trigger_queue (id),
    trigger_payload jsonb,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    sequence integer
,
        action_code varchar,
        condition_expression jsonb,
        parameter_queries jsonb,
        parameters_evaluated jsonb,
        status public.action_queue_status,
        output jsonb,
        time_queued timestamptz,
        time_completed timestamptz,
        error_log varchar
);

