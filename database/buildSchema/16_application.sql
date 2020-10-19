-- application 

CREATE TYPE public.application_outcome AS ENUM ('Pending', 'Approved', 'Rejected');

CREATE TYPE public.trigger as ENUM ('onApplicationCreate', 'onApplicationSubmit', 'onApplicationSave', 'onApplicationWithdrawn', 'onReviewStart', 'onReviewEditComment', 'onReviewSave', 'onReviewAssign', 'onApprovalSubmit', 'onScheduleTime');

CREATE TABLE public.application (
    id serial primary key,
    template_id integer references public.template(id),
    user_id integer references public.user(id),
    serial varchar,
    name varchar,
    outcome public.application_outcome,
    is_active bool,
    trigger public.trigger
);