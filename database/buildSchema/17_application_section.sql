-- application section
CREATE TABLE public.application_section (
    id serial PRIMARY KEY,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE,
    template_section_id integer REFERENCES public.template_section (id) ON DELETE CASCADE
);

