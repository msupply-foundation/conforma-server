-- application response

CREATE TABLE public.application_response (
    id serial primary key,
    template_element_id integer references public.template_element(id),
    application_id integer references public.application(id),
    value jsonb,
    is_valid boolean,
    timestamp timestamptz default current_timestamp
);