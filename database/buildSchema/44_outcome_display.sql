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
    permission_names varchar[] DEFAULT NULL,
    table_view_include_columns varchar[] DEFAULT NULL,
    table_view_exclude_columns varchar[] DEFAULT NULL,
    detail_view_include_columns varchar[] DEFAULT NULL,
    detail_view_exclude_columns varchar[] DEFAULT NULL,
    conflict_priority integer DEFAULT 1,
    -- Header for detail view
    detail_view_header_column varchar
);

-- For columns that require more detail format or evaluation definitions
CREATE TABLE outcome_display_column_definition (
    id serial PRIMARY KEY,
    table_name varchar,
    column_match varchar,
    title varchar,
    element_type_plugin_code varchar,
    additional_formatting jsonb,
    value_expression jsonb NOT NULL DEFAULT '{}',
    UNIQUE (table_name, column_match)
);

-- OLD TABLES -- LEAVING THESE HERE FOR NOW, DELETE ONCE MIGRATION COMPLETE
CREATE TABLE outcome_display_table (
    id serial PRIMARY KEY,
    column_name varchar,
    -- Text or full value from form element plugin
    is_text_column boolean,
    title varchar,
    outcome_display_id integer REFERENCES outcome_display (id) ON DELETE CASCADE
);

CREATE TABLE outcome_display_detail (
    id serial PRIMARY KEY,
    column_name varchar,
    title varchar,
    element_type_plugin_code varchar,
    is_text_column boolean,
    parameters jsonb,
    outcome_display_id integer REFERENCES outcome_display (id) ON DELETE CASCADE
);

