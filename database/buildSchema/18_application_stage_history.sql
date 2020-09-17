-- application stage history

CREATE TYPE public.application_stage AS ENUM ('Screening', 'Assessment', 'Final Decision'); 

CREATE TABLE public.application_stage_history (
    id serial primary key,
    application_id integer references public.application(id),
    stage public.application_stage,
    time_created timestamp with time zone,
    is_current bool
);