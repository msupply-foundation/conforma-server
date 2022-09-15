-- Data table display configs
CREATE TABLE data_view (
    id serial PRIMARY KEY,
    table_name varchar NOT NULL,
    title varchar,
    code varchar NOT NULL,
    permission_names varchar[],
    row_restrictions jsonb DEFAULT '{}',
    table_view_include_columns varchar[],
    table_view_exclude_columns varchar[],
    detail_view_include_columns varchar[],
    detail_view_exclude_columns varchar[],
    detail_view_header_column varchar NOT NULL,
    show_linked_applications boolean NOT NULL DEFAULT TRUE,
    priority integer DEFAULT 1
);

-- For columns that require more detail format or evaluation definitions
CREATE TABLE data_view_column_definition (
    id serial PRIMARY KEY,
    table_name varchar,
    column_name varchar,
    title varchar,
    element_type_plugin_code varchar,
    element_parameters jsonb,
    additional_formatting jsonb,
    value_expression jsonb,
    UNIQUE (table_name, column_name)
);

-- Table for cataloguing all "data" tables, including lookup tables
CREATE TABLE data_table (
    id serial PRIMARY KEY,
    table_name varchar NOT NULL UNIQUE,
    display_name varchar,
    field_map jsonb,
    is_lookup_table boolean DEFAULT FALSE
);

