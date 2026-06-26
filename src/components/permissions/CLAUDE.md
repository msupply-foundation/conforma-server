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

- `routeLogin` ([routes.ts](routes.ts)) verifies username/password (bcrypt) and calls `getUserInfo` ([loginHelpers.ts](loginHelpers.ts)), which gathers the user, orgs, and template permissions and signs a JWT. `routeLoginOrg` re-issues a JWT scoped to a chosen org.
- **JWT shape** (`compileJWT` in [rowLevelPolicyHelpers.ts](rowLevelPolicyHelpers.ts)):
  ```
  aud: 'postgraphile'
  userId, username, orgId, sessionId, isManager
  isAdmin
  role: 'postgres'            // ONLY when isAdmin — bypasses ALL RLS
  pp<policyId>: 't'           // user holds this policy
  pp<policyId>_template_ids: "1,2,3"   // templates the policy applies to
  ```
- Verified with `config.jwtSecret` (env `JWT_SECRET`, default `'devsecret'`). The REST `preValidation` hook in [../../server.ts](../../server.ts) populates `request.auth`; PostGraphile independently verifies the same token for GraphQL and exposes claims as `current_setting('jwt.claims.*')`.
- `sessionId` (a `nanoid`) lets the server invalidate a token if the user logs in elsewhere; `config.logoutAfterInactivity` bounds token age.

## RLS generation (`updateRowPolicies` in [rowLevelPolicyHelpers.ts](rowLevelPolicyHelpers.ts))

- Runs **on every startup** and again whenever permission policies are edited (admin route `GET /api/admin/updateRowPolicies`).
- It drops all previously-generated policies (names prefixed `view_`/`update_`/`create_`/`delete_`), then regenerates them from each `permission_policy.rules` via `compileRowLevelPolicies` → `compileRowLevelPolicy`. Generated `USING`/`WITH CHECK` clauses read `jwt.claims.*`: `replacePlaceholders` rewrites `jwtUserDetails_*`/`jwtPermission_*` placeholders into inline `current_setting('jwt.claims.…')` SQL (the `jwt_get_*` helper functions only appear when a policy's `rules` JSON references them directly).
- Every generated condition is guarded by a check that the policy claim is present (`pp<id>` set), so a query only runs the full condition if the user actually holds that policy.
- Rule sources can reference tables that get wrapped as `private.<table>` views (`security_invoker = false`) to avoid compounding policy checks.

## Routes (registered in [../../server.ts](../../server.ts))

`POST /api/public/login`, `GET /api/public/verify` (public — email verification), `POST /api/login-org`, `GET /api/user-info`, `GET /api/user-permissions`, `POST /api/create-hash`, `GET /api/check-unique`, and admin `GET /api/admin/updateRowPolicies`.

## Tests

`tests/permissions.test.ts` and `tests/rowLevelPolicyGeneration.test.ts` cover JWT/policy compilation as **pure functions (no DB needed)**. Run via `yarn test` (the full suite does need a DB). Update them when changing JWT shape or policy SQL generation.

## Security gotchas

- **`isAdmin` ⇒ `role: 'postgres'` ⇒ total RLS bypass.** Admin tokens run as the Postgres superuser and ignore every policy. Granting admin = granting full DB access; never set it from untrusted input.
- **GraphQL trusts the JWT directly** — there is no REST-style route guard in front of `/graphql`. All protection there is RLS. A leaked token grants exactly what its claims allow (and everything, if admin).
- **The write side is currently permissive**: `updateRowPolicies` hard-codes `INSERT/UPDATE/DELETE … WITH CHECK (true)` on `application`, `application_response`, `review`, `review_assignment` (marked temporary in code). Generated RLS mainly constrains **reads** (SELECT); don't assume writes are policy-filtered.
- **Policy `rules` compile to SQL.** Treat the admin-only policy editor as privileged; review changes to `getSqlConditionFromJSON` / `helpersUtilities.ts` carefully.
- The public file-download endpoint is **not** permission-checked (see repo overview).
