-- action plugins
CREATE TABLE public.action_plugin (
    code varchar PRIMARY KEY,
    name varchar,
    description varchar,
    path varchar,
    required_parameters varchar[],
    optional_parameters varchar[],
    output_properties varchar[]
);

