-- template_stage table

CREATE TABLE public.template_stage (
    id serial primary key,
    number integer,
    title varchar,
    description varchar,
    colour varchar DEFAULT '#24B5DF',
    template_id integer references public.template(id)
);