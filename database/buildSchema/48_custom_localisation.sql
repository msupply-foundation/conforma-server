-- language strings for custom elements (tempaltes, filters, etc.)
CREATE TABLE public.custom_localisation (
    id serial PRIMARY KEY,
    language_code varchar,
    strings jsonb DEFAULT '{}',
    template_id integer REFERENCES public.template (id) ON DELETE CASCADE,
    filter_id integer REFERENCES public.filter (id) ON DELETE CASCADE,
    outcome_display_id integer REFERENCES public.outcome_display (id) ON DELETE CASCADE,
    permission_name_id integer REFERENCES public.permission_name (id) ON DELETE CASCADE
);

