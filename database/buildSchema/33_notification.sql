-- notification

CREATE TABLE public.notification (
	id serial primary key,
	user_id integer references public.user(id),
	application_id integer references public.application(id),
	review_id integer references public.review(id),
	subject varchar,
	message varchar,
	document_id integer references public.file(id),
	is_read boolean
);