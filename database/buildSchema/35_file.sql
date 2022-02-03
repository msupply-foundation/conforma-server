-- file
CREATE TABLE public.file (
    id serial PRIMARY KEY,
    unique_id varchar UNIQUE NOT NULL,
    original_filename varchar NOT NULL,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    application_serial varchar REFERENCES public.application (serial) ON DELETE CASCADE,
    application_response_id integer REFERENCES public.application_response (id) ON DELETE CASCADE,
    description varchar,
    application_note_id integer REFERENCES public.application_note (id) ON DELETE CASCADE,
    is_output_doc boolean DEFAULT FALSE NOT NULL,
    file_path varchar NOT NULL,
    thumbnail_path varchar,
    mimetype varchar,
    submitted boolean DEFAULT FALSE,
    timestamp timestamptz DEFAULT CURRENT_TIMESTAMP
);

