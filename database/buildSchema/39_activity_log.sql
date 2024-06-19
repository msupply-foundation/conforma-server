-- ACTIVITY LOG
-- This script contains "DROP" and "IF EXISTS" statements as it is called as a whole from the migration script
CREATE TYPE public.event_type AS ENUM (
    'STAGE',
    'STATUS',
    'OUTCOME',
    'EXTENSION',
    'ASSIGNMENT',
    'REVIEW',
    'REVIEW_DECISION',
    'PERMISSION' -- This type not (necessarily) tied to an application
);

CREATE TABLE IF NOT EXISTS public.activity_log (
    id serial PRIMARY KEY,
    type public.event_type NOT NULL,
    value varchar NOT NULL,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE,
    "table" varchar NOT NULL,
    record_id integer,
    details jsonb NOT NULL DEFAULT '{}'
);

-- Make an index on the application_id field, since this is the one it will be
-- searched by most often
CREATE INDEX IF NOT EXISTS activity_log_application_index ON activity_log (application_id);

