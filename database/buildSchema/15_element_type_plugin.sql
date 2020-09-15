-- Plugins for QuestionType and InfoType elements

CREATE TABLE public.element_type_plugin (
	code varchar primary key,
	name varchar,
	description varchar,
	category public.template_element_category,
	path varchar,
	display_component_name varchar,
	config_component_name varchar,
	required_parameters varchar[]
);
