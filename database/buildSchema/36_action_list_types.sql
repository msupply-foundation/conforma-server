DROP TYPE IF EXISTS public.assigner_action;

CREATE TYPE public.assigner_action AS ENUM (
    'ASSIGN',
    'RE_ASSIGN'
);

DROP TYPE IF EXISTS public.reviewer_action;

CREATE TYPE public.reviewer_action AS ENUM (
    'SELF_ASSIGN',
    'START_REVIEW',
    'VIEW_REVIEW',
    'CONTINUE_REVIEW',
    'MAKE_DECISION',
    'RESTART_REVIEW',
    'UPDATE_REVIEW',
    'AWAITING_RESPONSE'
);

