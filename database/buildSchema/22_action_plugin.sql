-- action plugins

CREATE TABLE public.action_plugin (
    code varchar primary key,
    name varchar,
    description varchar,
    path varchar,
    function_name varchar,
    required_parameters varchar[]
);

