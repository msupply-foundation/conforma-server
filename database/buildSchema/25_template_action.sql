-- template action
CREATE TABLE public.template_action (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    code varchar,
    action_code varchar,
    event_code varchar,
    TRIGGER public.trigger,
    condition jsonb DEFAULT 'true' ::jsonb,
    parameter_queries jsonb,
    description varchar,
    sequence integer
);

-- Constraint ensuring that the "code" value must be unique per template
CREATE UNIQUE INDEX unique_template_action_code ON template_action (code, template_id);

