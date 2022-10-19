-- template_permission table
CREATE TABLE public.template_permission (
    id serial PRIMARY KEY,
    permission_name_id integer REFERENCES public.permission_name (id),
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE NOT NULL,
    allowed_sections varchar[] DEFAULT NULL,
    can_self_assign boolean NOT NULL DEFAULT FALSE,
    can_make_final_decision boolean NOT NULL DEFAULT FALSE,
    stage_number integer,
    level_number integer,
    restrictions jsonb
);

