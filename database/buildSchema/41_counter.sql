-- counters (for serial generation)
CREATE TABLE public.counter (
    id serial PRIMARY KEY,
    name varchar NOT NULL UNIQUE,
    value integer DEFAULT 0
);

