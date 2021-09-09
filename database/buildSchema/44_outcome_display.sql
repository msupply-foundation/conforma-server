CREATE TYPE public.outcome_display_type AS ENUM (
    'TABLE',
    'DETAIL'
);

-- Outcome display
CREATE TABLE outcome_display (
    id serial PRIMARY KEY,
    table_name varchar,
    title varchar,
    code varchar UNIQUE,
    table_view_include_columns varchar[] DEFAULT NULL,
    table_view_exclude_columns varchar[] DEFAULT NULL,
    detail_view_include_columns varchar[] DEFAULT NULL,
    detail_view_exclude_columns varchar[] DEFAULT NULL,
    -- Header for detail view
    detail_view_header_column varchar,
    display_type public.outcome_display_type DEFAULT NULL,
);

-- For columns that require more detail format or evaluation definitions
CREATE TABLE outcome_display_column_definition (
    id serial PRIMARY KEY,
    outcome_display_id integer REFERENCES outcome_display (id) ON DELETE CASCADE,
    title varchar,
    element_type_plugin_code varchar,
    additional_formatting jsonb,
    value jsonb NOT NULL
);

-- Details display when outcome is pressed in the table
CREATE TABLE outcome_display_detail (
    id serial PRIMARY KEY,
    column_name varchar,
    title varchar,
    element_type_plugin_code varchar,
    is_text_column boolean,
    parameters jsonb,
    outcome_display_id integer REFERENCES outcome_display (id) ON DELETE CASCADE
);

