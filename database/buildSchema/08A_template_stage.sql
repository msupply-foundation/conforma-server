-- template_stage table
CREATE TABLE public.template_stage (
    id serial PRIMARY KEY,
    number integer,
    title varchar,
    description varchar,
    colour varchar DEFAULT '#24B5DF',
    template_id integer REFERENCES public.template (id)
);

