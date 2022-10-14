-- notification
CREATE TABLE public.notification (
    id serial PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    application_id integer REFERENCES public.application (id) ON DELETE CASCADE,
    review_id integer REFERENCES public.review (id) ON DELETE CASCADE,
    email_recipients varchar,
    subject varchar,
    message varchar,
    attachments varchar[],
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_read boolean DEFAULT FALSE,
    email_sent boolean DEFAULT FALSE,
    email_server_log varchar
);

