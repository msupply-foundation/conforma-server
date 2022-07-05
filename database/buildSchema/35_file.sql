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
    is_preview_doc boolean DEFAULT FALSE NOT NULL,
    is_reference_doc boolean DEFAULT FALSE NOT NULL,
    file_path varchar NOT NULL,
    thumbnail_path varchar,
    mimetype varchar,
    submitted boolean DEFAULT FALSE,
    timestamp timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Function to Notify server of File deletion
CREATE OR REPLACE FUNCTION public.notify_file_server ()
    RETURNS TRIGGER
    AS $trigger_event$
BEGIN
    PERFORM
        pg_notify('file_notifications', json_build_object('id', OLD.id, 'uniqueId', OLD.unique_id, 'originalFilename', OLD.original_filename, 'filePath', OLD.file_path, 'thumbnailPath', OLD.thumbnail_path)::text);
    RETURN NULL;
END;
$trigger_event$
LANGUAGE plpgsql;

-- TRIGGER for file table
CREATE TRIGGER file_deletion
    AFTER DELETE ON public.file
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_file_server ();

