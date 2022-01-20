-- For primary and foreign key
CREATE OR REPLACE VIEW constraints_info AS
SELECT
    constraints_info.constraint_type,
    constraints_info.table_name AS from_table_name,
    from_column_info.column_name AS from_column_name,
    to_column_info.table_name AS to_table_name,
    to_column_info.column_name AS to_column_name
FROM
    information_schema.table_constraints AS constraints_info
    JOIN information_schema.key_column_usage AS from_column_info ON constraints_info.constraint_name = from_column_info.constraint_name
    JOIN information_schema.constraint_column_usage AS to_column_info ON constraints_info.constraint_name = to_column_info.constraint_name;

-- For full schema info
CREATE OR REPLACE VIEW schema_columns AS
SELECT
    tables_info.table_name,
    tables_info.table_type AS table_type,
    columns_info.column_name,
    columns_info.is_nullable,
    columns_info.is_generated,
    columns_info.data_type,
    element_types.data_type AS sub_data_type,
    constraints_info.constraint_type,
    constraints_info.to_table_name AS fk_to_table_name,
    constraints_info.to_column_name AS fk_to_column_name
FROM
    information_schema.tables AS tables_info
    JOIN information_schema.columns AS columns_info ON tables_info.table_name = columns_info.table_name
    LEFT JOIN information_schema.element_types AS element_types ON columns_info.dtd_identifier = element_types.collection_type_identifier
        AND columns_info.table_name = element_types.object_name
    LEFT JOIN constraints_info ON columns_info.table_name = constraints_info.from_table_name
        AND columns_info.column_name = constraints_info.from_column_name
WHERE
    tables_info.table_schema != 'pg_catalog'
    AND tables_info.table_schema != 'information_schema'
ORDER BY
    columns_info.table_name,
    columns_info.column_name;

CREATE VIEW postgres_row_level AS
SELECT
    *
FROM
    pg_policies
