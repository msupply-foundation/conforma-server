-- template element (questions or information elements)

CREATE TYPE public.template_element_category AS ENUM ('Question', 'Information');

CREATE TABLE public.template_element (
    id serial primary key,
    section_id integer references public.template_section(id),
    code varchar NOT NULL,
    next_element_code varchar,
    title varchar,
    category public.template_element_category,
    visibility_condition jsonb,
    element_type_plugin_code varchar,
    is_required boolean,
    is_editable boolean,
    parameters jsonb,
    default_value jsonb,
    validation jsonb
);
