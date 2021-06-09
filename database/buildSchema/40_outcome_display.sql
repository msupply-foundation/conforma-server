-- Outcome display
CREATE TABLE outcome_display (
    id serial PRIMARY KEY,
    table_name varchar,
    -- For graphQL query
    plural_table_name varchar,
    title varchar,
    code varchar UNIQUE,
    -- Title for detail view
    detail_column_name varchar
);

-- Table display (when outcome is pressed)
CREATE TABLE outcome_display_table (
    id serial PRIMARY KEY,
    column_name varchar,
    -- Text or full value from form element plugin
    is_text_column boolean,
    title varchar,
    outcome_display_id integer REFERENCES outcome_display (id)
);

-- Details display when outcome is pressed in the table
CREATE TABLE outcome_display_detail (
    id serial PRIMARY KEY,
    column_name varchar,
    title varchar,
    element_type_plugin_code varchar,
    is_text_column boolean,
    parameters jsonb,
    outcome_display_id integer REFERENCES outcome_display (id)
);

