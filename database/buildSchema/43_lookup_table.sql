-- lookup table
CREATE TABLE lookup_table (
    id serial PRIMARY KEY,
    name varchar,
    label varchar,
    field_map jsonb
);

