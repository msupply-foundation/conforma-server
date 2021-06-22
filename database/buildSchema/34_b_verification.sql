-- verification
CREATE TABLE public.verification (
    id serial PRIMARY KEY,
    unique_id varchar UNIQUE NOT NULL,
    is_verified boolean DEFAULT FALSE,
    created_time timestamptz DEFAULT NOW(),
    expiry_time timestamptz,
    TRIGGER public.trigger
);

