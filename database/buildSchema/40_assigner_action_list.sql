DROP TYPE IF EXISTS public.assigner_action;

CREATE TYPE public.assigner_action AS ENUM (
    'ASSIGN',
    'ASSIGN_LOCKED',
    'RE_ASSIGN'
);

