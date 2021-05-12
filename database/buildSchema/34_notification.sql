-- notification
CREATE TABLE public.notification (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id),
    application_id integer REFERENCES public.application (id),
    review_id integer REFERENCES public.review (id),
    subject varchar,
    message varchar,
    document_id integer REFERENCES public.file (id),
    is_read boolean
);

