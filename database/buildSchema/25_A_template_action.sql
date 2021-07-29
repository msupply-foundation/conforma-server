-- template action
CREATE TABLE public.template_action (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id),
    action_code varchar,
    event_code varchar,
    TRIGGER public.trigger,
    sequence integer
,
        condition jsonb DEFAULT 'true' ::jsonb,
        parameter_queries jsonb
);

