-- template_stage table

CREATE TABLE public.template_stage (
    id serial primary key,
    template_id integer references public.template(id)
);