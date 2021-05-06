-- template_section table
CREATE TABLE public.template_section (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id),
    title varchar,
    code varchar,
    index integer
);

