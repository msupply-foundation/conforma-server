-- notification
CREATE TABLE public.notification (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id),
    application_id integer REFERENCES public.application (id),
    review_id integer REFERENCES public.review (id),
    email_recipients varchar[],
    subject varchar,
    message varchar,
    attachments varchar[],
    is_read boolean
);

