-- file

CREATE TABLE public.file (
	id serial primary key,
	user_id integer references public.user(id),
	original_filename varchar,
	path varchar,
	mimetype varchar,
	application_id integer references public.application(id),
	application_response_id integer references public.application_response(id)
);