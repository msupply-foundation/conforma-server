-- notification
CREATE TABLE public.notification (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id),
    application_id integer REFERENCES public.application (id),
    email_recipients varchar,
    subject varchar,
    message varchar,
    attachments varchar[],
    email_sent boolean DEFAULT FALSE,
    is_read boolean DEFAULT FALSE
);

