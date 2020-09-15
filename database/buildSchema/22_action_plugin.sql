-- action plugins

CREATE TABLE public.action_plugin (
--    id serial primary key,
    code varchar primary key,
    name varchar,
    description varchar,
    path varchar,
    function_name varchar,
    required_parameters varchar[]
);

