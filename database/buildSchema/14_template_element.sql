-- template element (questions or information elements)

CREATE TYPE public.template_element_category AS ENUM ('Question', 'Information');

-- FUNCTION to return template_code for current element/section
CREATE or replace FUNCTION public.get_template_code(section_id int)
RETURNS VARCHAR AS $$
	SELECT template.code FROM template JOIN template_section
	ON template_id = template.id
	WHERE template_section.id = $1;
$$ LANGUAGE SQL IMMUTABLE;

CREATE TABLE public.template_element (
    id serial primary key,
    section_id integer references public.template_section(id),
    code varchar NOT NULL,
    index integer,
    title varchar,
    category public.template_element_category,
    element_type_plugin_code varchar,
    visibility_condition jsonb DEFAULT '{"value":true}'::jsonb,
    is_required jsonb DEFAULT '{"value":true}'::jsonb,
    is_editable jsonb DEFAULT '{"value":true}'::jsonb,
    validation jsonb DEFAULT '{"value":true}'::jsonb,
    validation_message varchar,
    parameters jsonb,
    template_code varchar GENERATED ALWAYS AS (public.get_template_code(section_id)) STORED,
    UNIQUE (template_code, code)
);