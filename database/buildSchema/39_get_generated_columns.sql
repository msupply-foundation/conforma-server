CREATE VIEW generated_columns AS
SELECT
    table_name,
    column_name
FROM
    information_schema.columns
WHERE
    is_generated = 'ALWAYS'
