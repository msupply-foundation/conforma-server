-- user_session table
--
-- One row per login. The refresh token is stored hashed (SHA-256), and that
-- hash is the primary key, so a session has exactly one live token by
-- construction and renewal lookups use the key's own index.
--
-- There is deliberately no "id", "created_at" or "revoked_at": revocation is
-- row deletion, so revoked/expired/never-existed all collapse to "no row".
--
-- session_id is the JWT "sessionId" claim, which row-level security evaluates
-- for public (shared-account) applicants. It is NOT unique: the same applicant
-- may resume a form on more than one device, giving several rows that share a
-- (user_id, session_id) pair.
CREATE TABLE public.user_session (
    token_hash varchar PRIMARY KEY,
    user_id integer REFERENCES public.user (id) ON DELETE CASCADE NOT NULL,
    org_id integer REFERENCES public.organisation (id) ON DELETE SET NULL,
    session_id varchar NOT NULL,
    expires_at timestamptz NOT NULL
);
