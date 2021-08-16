-- review assignment assigner join
CREATE TABLE public.review_assignment_assigner_join (
    id serial PRIMARY KEY,
    assigner_id integer REFERENCES public.user (id) ON DELETE CASCADE,
    organisation_id integer REFERENCES public.organisation (id) ON DELETE CASCADE,
    review_assignment_id integer REFERENCES public.review_assignment (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX unique_review_assignment_assigner_with_org ON review_assignment_assigner_join (assigner_id, organisation_id, review_assignment_id)
WHERE
    organisation_id IS NOT NULL;

CREATE UNIQUE INDEX unique_review_assignment_assigner_no_org ON review_assignment_assigner_join (assigner_id, review_assignment_id)
WHERE
    organisation_id IS NULL;

