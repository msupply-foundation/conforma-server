-- template action

CREATE TABLE public.template_action (
    id serial primary key,
    template_id integer references public.template(id),
    action_code varchar,
    previous_action_id integer references public.template_action(id),
    trigger public.trigger,
    condition jsonb,
    parameter_queries jsonb
);