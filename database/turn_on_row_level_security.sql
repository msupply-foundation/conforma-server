-- Connect to database first:
\c tmf_app_manager
ALTER TABLE public.application ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.review ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.review_assignment ENABLE ROW LEVEL SECURITY;

