-- review question assignment
CREATE TABLE public.review_question_assignment (
    id serial PRIMARY KEY,
    template_element_id integer REFERENCES public.template_element (id),
    review_assignment_id integer REFERENCES public.review_assignment (id)
);