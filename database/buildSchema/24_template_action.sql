-- template action

CREATE TABLE public.template_action (
    id serial primary key,
    template_id integer references public.template(id),
    action_code varchar,
    trigger public.trigger,
    sequence integer,
    condition jsonb,
    parameter_queries jsonb
);