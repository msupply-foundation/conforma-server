-- template_section table
CREATE TABLE public.template_section (
    id serial PRIMARY KEY,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    title varchar,
    code varchar,
    index integer,
    UNIQUE (template_id, code)
);

