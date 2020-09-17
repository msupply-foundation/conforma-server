-- template_permission table

CREATE TABLE public.template_permission (
    id serial primary key,
    permission_join_id integer references public.permission_join(id),
    template_id integer references public.template(id),
    template_section_id integer references public.template_section(id),
    permission_policy_id integer references public.permission_policy(id),
    restrictions jsonb
);