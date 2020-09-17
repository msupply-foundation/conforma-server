-- template review stage

CREATE TABLE public.template_review_stage (
    id serial primary key,
    template_stage_id integer references public.template_stage(id),
    permission_join_id integer references public.permission_join(id),
    next_review_stage_id integer references public.template_review_stage(id),
    name varchar
);