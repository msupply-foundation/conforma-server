-- template_section table

CREATE TABLE public.template_section (
    id serial primary key,
    template_id integer references public.template(id),
    title varchar,
    code varchar,
    index integer
);