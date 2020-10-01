-- action plugins

CREATE TABLE public.action_plugin (
    code varchar primary key,
    name varchar,
    type varchar,
    description varchar,
    path varchar,
    file varchar,
    function_name varchar,
    required_parameters varchar[],
    info jsonb
);

