-- action plugins
CREATE TABLE public.action_plugin (
    id serial PRIMARY KEY,
    code varchar UNIQUE,
    name varchar,
    description varchar,
    path varchar,
    required_parameters varchar[],
    optional_parameters varchar[],
    output_properties varchar[]
);

