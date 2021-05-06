-- file
CREATE TABLE public.file (
    id serial PRIMARY KEY,
    unique_id varchar UNIQUE NOT NULL,
    original_filename varchar NOT NULL,
    user_id integer REFERENCES public.user (id),
    application_serial varchar REFERENCES public.application (serial),
    application_response_id integer REFERENCES public.application_response (id),
    file_path varchar NOT NULL,
    thumbnail_path varchar,
    mimetype varchar,
    submitted boolean DEFAULT FALSE,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
);

