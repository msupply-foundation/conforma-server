-- When a field is created as `SERIAL` postgres adds a seqeunce for it, and adds default values for that field

-- For example:
-- CREATE TABLE test_serial (id SERIAL)

-- Will result in:
-- CREATE TABLE IF NOT EXISTS public.test_serial
-- (
--     id integer NOT NULL DEFAULT nextval('test_serial_id_seq'::regclass)
-- )

-- Sequences can be queried by
-- SELECT relname FROM pg_class WHERE relkind = 'S'
-- Will result in:
--       relname       
-- --------------------
-- test_serial_id_seq

-- In order to update all serial/sequences to the latest version we want to build sql statement for each sequence with setval
-- for the example above it would look like this
-- SELECT SETVAL('test_serial_id_seq', COALESCE(MAX(id), 1)) FROM test_serial;

-- We can use pg_class query above and get the column and table that has that sequence as default nextval

-- To get default values for a column we can run
-- SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public';
-- Will result in
--  table_name  | column_name |             column_default              
-- -------------+-------------+-----------------------------------------
--  test_serial | id          | nextval('test_serial_id_seq'::regclass)

-- We can use combination of those queries to create SQL statements that update sequences to the latest version

-- Let's create another table, and insert some values, and add a couple of rows
-- CREATE TABLE serial_test (id SERIAL, another_serial SERIAL, value TEXT)
-- INSERT INTO serial_test(value) VALUES('check');
-- INSERT INTO serial_test(value) VALUES('check');
-- INSERT INTO serial_test(value) VALUES('check');

-- Running below query will result in
-- -----------------------------------------------------------------------------------------------------
-- SELECT SETVAL('serial_test_id_seq', COALESCE(MAX(id), 1)) FROM serial_test;
-- SELECT SETVAL('serial_test_another_serial_seq', COALESCE(MAX(another_serial), 1)) FROM serial_test;
-- SELECT SETVAL('test_serial_id_seq', COALESCE(MAX(id), 1)) FROM test_serial;

-- And running those individual will result in
-- SELECT SETVAL('serial_test_id_seq', COALESCE(MAX(id), 1)) FROM serial_test; = 3
-- SELECT SETVAL('serial_test_another_serial_seq', COALESCE(MAX(another_serial), 1)) FROM serial_test; = 3
-- SELECT SETVAL('test_serial_id_seq', COALESCE(MAX(id), 1)) FROM test_serial; = 1

-- Check out gist (in case there is community updates): https://gist.github.com/andreievg/f10164566ff503bc7fa6f33c4e797785

SELECT 'SELECT SETVAL(' || quote_literal(sequence_number.relname) || ', COALESCE(MAX(' || quote_ident(table_and_column.column_name) || '), 1)) FROM ' || quote_ident(table_and_column.table_name) || ';'
FROM information_schema.columns AS table_and_column
JOIN pg_class AS sequence_number ON table_and_column.column_default LIKE 'nextval(' || quote_literal(sequence_number.relname) || '::regclass)'
WHERE sequence_number.relkind = 'S'
ORDER BY table_and_column.table_name
