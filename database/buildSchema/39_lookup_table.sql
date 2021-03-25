-- lookup table
CREATE TABLE lookup_table (
    id serial primary key,
    name varchar,
    label varchar,
    field_map jsonb
);
