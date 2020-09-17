-- application section 

CREATE TABLE public.application_section (
    id serial primary key,
    application_id integer references public.application(id),
    template_section_id integer references public.template_section(id)
);
