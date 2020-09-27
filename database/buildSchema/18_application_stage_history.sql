-- application stage history

CREATE TABLE public.application_stage_history (
    id serial primary key,
    application_id integer references public.application(id),
    stage_id integer references public.template_stage(id),
    time_created timestamp,
    is_current bool
);