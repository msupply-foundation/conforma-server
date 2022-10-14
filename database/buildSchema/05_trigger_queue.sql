-- trigger queue
CREATE TYPE public.trigger AS ENUM (
    'ON_APPLICATION_CREATE',
    'ON_APPLICATION_RESTART',
    'ON_APPLICATION_SUBMIT',
    'ON_APPLICATION_SAVE',
    'ON_APPLICATION_WITHDRAW',
    'ON_REVIEW_CREATE',
    'ON_REVIEW_SUBMIT',
    'ON_REVIEW_RESTART',
    'ON_REVIEW_ASSIGN',
    'ON_REVIEW_UNASSIGN',
    'ON_APPROVAL_SUBMIT',
    'ON_VERIFICATION',
    'ON_SCHEDULE',
    'ON_PREVIEW',
    'ON_EXTEND',
    'DEV_TEST',
    'PROCESSING',
    'ERROR'
);

CREATE TYPE public.trigger_queue_status AS ENUM (
    'TRIGGERED',
    'ACTIONS_DISPATCHED',
    'ERROR',
    'COMPLETED'
);

CREATE TABLE public.trigger_queue (
    id serial PRIMARY KEY,
    trigger_type public.trigger,
    "table" varchar,
    record_id int,
    event_code varchar,
    data jsonb,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP,
    status public.trigger_queue_status,
    log jsonb
);

