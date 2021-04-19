-- template_stage table

CREATE TABLE public.template_stage (
    id serial primary key,
    number integer,
    title varchar,
    description varchar,
    template_id integer references public.template(id)
);