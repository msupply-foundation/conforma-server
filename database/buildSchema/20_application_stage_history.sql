-- application stage history
CREATE TABLE public.application_stage_history (
    id serial PRIMARY KEY,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE NOT NULL,
    stage_id integer REFERENCES public.template_stage (id) ON DELETE CASCADE NOT NULL,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    is_current bool DEFAULT TRUE
);

