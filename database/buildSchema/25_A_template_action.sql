-- template action
CREATE TABLE public.template_action (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id),
    code varchar,
    action_code varchar,
    event_code varchar,
    TRIGGER public.trigger,
    condition jsonb DEFAULT 'true' ::jsonb,
    parameter_queries jsonb,
    description varchar,
    sequence integer
);

CREATE FUNCTION public.template_action_parameters_queries_string (template_action public.template_action)
    RETURNS text
    AS $$
    SELECT
        parameter_queries::text
    FROM
        public.template_action
    WHERE
        id = $1.id
$$
LANGUAGE sql
STABLE;

