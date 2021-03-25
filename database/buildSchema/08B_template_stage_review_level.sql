-- template_stage_review_level table

CREATE TABLE public.template_stage_review_level (
    id serial primary key,
    stage_id integer references public.template_stage(id),
    number integer NOT NULL,
    name varchar NOT NULL,
    description varchar
);