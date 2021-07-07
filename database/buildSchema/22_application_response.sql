-- application response
CREATE TYPE public.application_response_status AS ENUM (
    'DRAFT',
    'SUBMITTED'
);

CREATE TABLE public.application_response (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id),
    application_id integer REFERENCES public.application (id),
    stage_number integer DEFAULT NULL,
    status public.application_response_status DEFAULT 'DRAFT',
    value jsonb,
    is_valid boolean,
    time_created timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_updated timestamptz DEFAULT CURRENT_TIMESTAMP,
    time_submitted timestamptz DEFAULT NULL
);

