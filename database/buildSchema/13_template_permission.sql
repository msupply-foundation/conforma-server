-- template_permission table

CREATE TABLE public.template_permission (
    id serial primary key,
    permission_name_id integer references public.permission_name(id),
    template_id integer references public.template(id),
    template_section_id integer references public.template_section(id),
    restrictions jsonb
);