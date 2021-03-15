-- file

CREATE TABLE public.file (
	id serial primary key,
	unique_id varchar UNIQUE NOT NULL,
	original_filename varchar NOT NULL,
	user_id integer references public.user(id),
	application_serial varchar references public.application(serial),
	application_response_id integer references public.application_response(id),
	file_path varchar NOT NULL,
	thumbnail_path varchar,
	mimetype varchar,
	submitted boolean DEFAULT false,
	timestamp timestamptz default current_timestamp	
);