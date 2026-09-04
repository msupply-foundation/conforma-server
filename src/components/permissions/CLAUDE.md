# permissions/ — auth, JWT & row-level security

**Security-sensitive.** This component issues JWTs at login and generates the Postgres **row-level security (RLS)** policies that are Conforma's real access-control boundary. Most data access rules are enforced in the database, driven by JWT claims — not in application code. (Repo overview: [../../../CLAUDE.md](../../../CLAUDE.md). Concepts: [../../../documentation/Database-Schema-Permission.md](../../../documentation/Database-Schema-Permission.md).)

## Permission model

Four tables compose into the `permissions_all` view:

- **`permission_policy`** — *what action + when*. Has a `type` (e.g. `APPLY`, `REVIEW`, `ASSIGN`, `VIEW`) and a JSON `rules` object that compiles to SQL conditions (used to build RLS policies).
- **`permission_name`** — a named, grantable permission that points at a policy.
- **`permission_join`** — grants a `permission_name` to a **user** or an **organisation**.
- **`template_permission`** — binds a `permission_name` to a specific template (with section/stage/level restrictions, self-assign flags, etc.).

A user's effective access = the policies reachable through their permission joins, scoped to the templates those permissions are bound to.

## Login & JWT

- `routeLogin` ([routes.ts](routes.ts)) verifies username/password (bcrypt) and calls `getUserInfo` ([loginHelpers.ts](loginHelpers.ts)), which gathers the user, orgs, and template permissions and signs a JWT. It then opens a **session** ([userSessions.ts](userSessions.ts)) and returns its refresh token as an HttpOnly cookie ([sessionCookies.ts](sessionCookies.ts)). `routeLoginOrg` re-issues a JWT scoped to a chosen org and writes that org onto the **existing** session row — same login, same refresh token.
- **JWT shape** (`compileJWT` in [rowLevelPolicyHelpers.ts](rowLevelPolicyHelpers.ts)):
  ```
  aud: 'postgraphile'
  userId, username, orgId, sessionId, isManager
  isAdmin
  role: 'postgres'            // ONLY when isAdmin — bypasses ALL RLS
  pp<policyId>: 't'           // user holds this policy
  pp<policyId>_template_ids: "1,2,3"   // templates the policy applies to
  iat, exp                    // access-token lifetime (see below)
  ```
- Verified with `config.jwtSecret` (env `JWT_SECRET`, default `'devsecret'`). The REST `preValidation` hook in [../../server.ts](../../server.ts) populates `request.auth`; PostGraphile independently verifies the same token for GraphQL and exposes claims as `current_setting('jwt.claims.*')`.
- **Both tokens travel as HttpOnly cookies, never in a response body** ([sessionCookies.ts](sessionCookies.ts)). An `onRequest` hook ([accessTokenMiddleware.ts](accessTokenMiddleware.ts)) turns the access cookie into an `Authorization: Bearer` header before every request, so neither surface needs to know cookies exist.
- `sessionId` (a `nanoid`, settable by the client at login) identifies an **applicant**, not a login. It is written onto `application.session_id` and evaluated by RLS, which is what isolates one public applicant from the next on the shared `nonRegistered` account — so a renewal has to reproduce it exactly. It is **not** a revocation handle, and logging in elsewhere invalidates nothing.
- **Two clocks, both derived from `config.logoutAfterInactivity`** ([userSessions.ts](userSessions.ts)):
  - the access token's `exp` — a fraction of the inactivity window (`/12`, capped at an hour), set at mint and never updated. Both surfaces enforce it through the same check, since `jsonwebtoken.verify` rejects on `exp` and PostGraphile already calls verify. There is no hand-rolled expiry in the REST hook any more, and no `isProductionBuild` gate: dev expires tokens too.
  - the session's `expires_at` — the inactivity window itself, in the `user_session` table.
  `getAdminJWT()` is deliberately left unexpiring: it is cached for the life of the process by `graphQLConnect.ts` and `FigTree.ts`.

## Renewal ([accessTokenMiddleware.ts](accessTokenMiddleware.ts))

- Registered as a root-level `onRequest` hook, so it runs before **both** the REST `preValidation` hook and PostGraphile. PostGraphile 4 reads the JWT only from `Authorization: Bearer` and offers no cookie source in library mode, which is why translation happens here rather than in either surface.
- The rule is *"no usable access token, but a live session → mint one"*, where **missing and expired are the same case**. That is what lets a machine client work with no code of its own: it sends only a provisioned refresh token, never logs in, and takes the ordinary renewal path.
- A token presented in the `Authorization` header wins over the cookie, so scripted callers and internal requests are unaffected.
- Renewal is triggered by **rejection, not a clock**. Every claim is rebuilt from the session row (never from the expired token), and minting extends `expires_at` — so an active client costs one write per access-token lifetime, not one per request.
- `GET /api/user-info` is the designated "still here" call and extends the session *whether or not* a token was minted; everything else extends it only as a side effect of minting.
- Failures here are logged and swallowed: the hook runs on every request including public ones, so it must never turn into a 500.

## Sessions ([userSessions.ts](userSessions.ts))

- A row in `user_session` is **one login**. Its primary key is the SHA-256 hash of a random refresh token, so a session has exactly one live token and revocation is deleting the row — revoked, expired and never-existed all collapse to "no row".
- The row carries `org_id` and `session_id` because both are authorisation state a renewed token must reproduce: `getUserInfo` merges org-granted permissions, and RLS reads `sessionId`.
- Multiple concurrent sessions per user are **required** (a second browser must not evict the first), so there is no unique index on `user_id`, and `session_id` is deliberately not unique either.
- Public (`nonRegistered`) sessions get a shorter window, since every hit on a public form URL creates a row.
- The table is hidden from GraphQL ([postgraphile.tags.json5](../../../postgraphile.tags.json5)) and has RLS enabled with no policies.
- **Snapshots dump and restore it like any other table** — a snapshot is a faithful copy of the database, so another system's sessions do come across with its snapshot. On top of that, [sessionRestore.ts](sessionRestore.ts) carries the restoring admin's *own* session across the `DROP SCHEMA` that `useSnapshot` runs, re-resolved **by username** (the user id may now be someone else) with `org_id` kept only when it is the system org. Two supporting pieces are easy to overlook: the sweep is suspended for the duration (`pauseSessionSweep`), or it would tell every connected client its session had ended; and [routeUseSnapshot](../snapshots/routes/routeUseSnapshot.ts) expires the access cookie on success, or the admin keeps pre-restore claims until it lapses.
- Sessions are also how Conforma authenticates **to another Conforma**: `externalApiConfigs`' `ConformaSession` auth type ([../external-apis/authHeaders.ts](../external-apis/authHeaders.ts)) sends a peer-provisioned token as the refresh cookie, then carries the access token the peer mints back to it ([conformaSession.ts](../external-apis/conformaSession.ts)) so the peer only mints again once that one expires. Same mechanism, pointed outward.
- Full rationale: [kdd/auth-token-lifecycle](../../../kdd/auth-token-lifecycle/kdd.md).

## RLS generation (`updateRowPolicies` in [rowLevelPolicyHelpers.ts](rowLevelPolicyHelpers.ts))

- Runs **on every startup** and again whenever permission policies are edited (admin route `GET /api/admin/updateRowPolicies`).
- It drops all previously-generated policies (names prefixed `view_`/`update_`/`create_`/`delete_`), then regenerates them from each `permission_policy.rules` via `compileRowLevelPolicies` → `compileRowLevelPolicy`. Generated `USING`/`WITH CHECK` clauses read `jwt.claims.*`: `replacePlaceholders` rewrites `jwtUserDetails_*`/`jwtPermission_*` placeholders into inline `current_setting('jwt.claims.…')` SQL (the `jwt_get_*` helper functions only appear when a policy's `rules` JSON references them directly).
- Every generated condition is guarded by a check that the policy claim is present (`pp<id>` set), so a query only runs the full condition if the user actually holds that policy.
- Rule sources can reference tables that get wrapped as `private.<table>` views (`security_invoker = false`) to avoid compounding policy checks.

## Routes (registered in [../../server.ts](../../server.ts))

`POST /api/public/login`, `GET /api/public/verify` (public — email verification), `POST /api/login-org`, `POST /api/logout`, `GET /api/user-info`, `GET /api/user-permissions`, `POST /api/create-hash`, `GET /api/check-unique`, and admin `GET /api/admin/updateRowPolicies`.

`POST /api/logout` deletes **every** session for the user (logging in elsewhere revokes nothing, but an explicit logout ends everything) and expires both cookies. Revocation is not instant for other browsers: their access token is stateless, so it keeps working until its own `exp` passes — after which renewal finds no session. On the shared public account it collapses to ending just the calling session.

## Tests

`tests/permissions.test.ts` and `tests/rowLevelPolicyGeneration.test.ts` cover JWT/policy compilation as **pure functions (no DB needed)**. Run via `yarn test` (the full suite does need a DB). Update them when changing JWT shape or policy SQL generation.

## Security gotchas

- **`isAdmin` ⇒ `role: 'postgres'` ⇒ total RLS bypass.** Admin tokens run as the Postgres superuser and ignore every policy. Granting admin = granting full DB access; never set it from untrusted input.
- **GraphQL trusts the JWT directly** — there is no REST-style route guard in front of `/graphql`. All protection there is RLS. A leaked token grants exactly what its claims allow (and everything, if admin).
- **The write side is currently permissive**: `updateRowPolicies` hard-codes `INSERT/UPDATE/DELETE … WITH CHECK (true)` on `application`, `application_response`, `review`, `review_assignment` (marked temporary in code). Generated RLS mainly constrains **reads** (SELECT); don't assume writes are policy-filtered.
- **Policy `rules` compile to SQL.** Treat the admin-only policy editor as privileged; review changes to `getSqlConditionFromJSON` / `helpersUtilities.ts` carefully.
- The public file-download endpoint is **not** permission-checked (see repo overview).
