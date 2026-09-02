# KDD: Authentication refactor

**Status:** Draft (2026-09-02)
**Decision:**

- **Add an `exp` claim to the JWT**, so REST and GraphQL both reject expired tokens through the same check — replacing REST's hand-rolled expiry calculation, which GraphQL never had (§1).
- **A `user_session` table backs browser sessions** — a refresh token held in a cookie JavaScript cannot read, exchanged for a new access token when the old one runs out. Revocation is row deletion (§2).
- **Both tokens are HttpOnly cookies.** A thin middleware in front of PostGraphile translates the access cookie into an `Authorization: Bearer` header, and renews it silently when it has expired, so no token ever enters JavaScript and no endpoint returns one in a response body (§3).
- **Machine clients (mSupply, a peer Conforma server) are ordinary users** — a dedicated non-admin service account using the same login endpoint and the same access token with the same claims. Whether its durable secret is a password or a provisioned session credential is the one **open question** left for review (§4).
- **Renewal is triggered by rejection, not by a clock**, and extends the session each time a token is minted. Expiry is pushed to idle clients over the existing websocket (§5).
- **Public forms keep working unchanged.** They share one account and are isolated from each other by an RLS policy on `sessionId`, which makes that claim an access-control input the session must preserve exactly (§6).
- **`externalApiConfigs` supports credentials that expire** — Conforma can log in to an external API, reuse the token, and acquire a fresh one when that API rejects it, invisibly to its own caller (§7).

> Driven by [conforma-templates#342](https://github.com/msupply-foundation/conforma-templates/issues/342) (mSupply ↔ Conforma bidirectional integration), whose Challenge 1 is exactly this question in both directions: _"What authorization schemes does each of these APIs use, and how do we persist login info while allowing for re-login if necessary?"_ Background: [`src/components/permissions/CLAUDE.md`](../../src/components/permissions/CLAUDE.md) and [`documentation/External-API-Access.md`](../../documentation/External-API-Access.md).

## Context

Conforma's auth was built for one caller — a human in a browser. Login signs a JWT ([`loginHelpers.ts:116`](../../src/components/permissions/loginHelpers.ts#L116)) carrying `userId`/`orgId`/`sessionId`, `isAdmin`, and the `pp<policyId>` claims that RLS reads ([`rowLevelPolicyHelpers.ts:35`](../../src/components/permissions/rowLevelPolicyHelpers.ts#L35)). #342 adds a machine caller in each direction, which is what forced this KDD. Four things are wrong or missing.

- **The JWT has no `exp`, and the two surfaces diverge as a result.** [`getSignedJWT`](../../src/components/permissions/loginHelpers.ts#L160) signs with no options, so the only time data is the `iat` jsonwebtoken adds automatically. REST *does* expire tokens, but not via the JWT — the `preValidation` hook recomputes the deadline itself, `iat * 1000 + logoutAfterInactivity * 60_000` ([`server.ts:160`](../../src/server.ts#L160)), and only when `config.isProductionBuild`. **GraphQL expires nothing, anywhere**: PostGraphile's only check is `jsonwebtoken.verify`, which rejects on `exp`, and there is none. GraphQL is the entire data surface, so in practice a leaked Conforma JWT has never expired.
- **Nothing is revocable.** No session state exists server-side, so a token cannot be withdrawn once issued. Changing `JWT_SECRET` is the only kill switch, and it logs out everyone. (`sessionId` does **not** serve this purpose — see §6; it identifies an applicant, not a login.)
- **The access token is its own renewal credential, so a lapse is unrecoverable.** Renewal means presenting the still-valid token to `/api/user-info`; once expired there is nothing left to present. A `setInterval` ([`UserState.tsx:167`](../../../conforma-web-app/src/contexts/UserState/UserState.tsx#L167)) is therefore the only thing between a user and a logout — and browsers throttle background-tab timers and freeze them once a tab has been hidden a while.
- **Server-as-client can only hold a fixed secret.** The relay at `POST /api/external-api/:name/:route` ([`server.ts:368`](../../src/server.ts#L368)) supports `Basic` or `Bearer` only ([`external-apis/types.ts:3`](../../src/components/external-apis/types.ts#L3)), applied verbatim by [`constructAuthHeader`](../../src/components/external-apis/helpers.ts#L9). No OAuth2, no re-login, no 401 handling anywhere in the codebase. But mSupply hands out a session token from a login call — a credential that expires, which the config cannot express.

#342 needs both directions: Conforma calling mSupply's item API, and mSupply calling Conforma's `/data-views` ([`server.ts:360-363`](../../src/server.ts#L360-L363)), which sits in the authenticated tier and so needs a Conforma access token and a way to keep having one.

## The flow

**1 — Login with credentials**

```
POST /api/public/login   { username, password, sessionId? }
  → bcrypt check
  → INSERT user_session { user_id, org_id: NULL, session_id, token_hash, expires_at }
  ← Set-Cookie: refresh   (HttpOnly, Secure, SameSite=Strict, Path=/)
  ← Set-Cookie: access    (HttpOnly, Secure, SameSite=Strict, Path=/)
                          (JWT — user claims only, no orgId)
  ← body: { success, user, templatePermissions, orgList }     ← no tokens
```

`sessionId` is still accepted from the client and still minted when absent — see §6. `orgList` still comes back in the body ([`loginHelpers.ts:140`](../../src/components/permissions/loginHelpers.ts#L140)), so the org picker is unaffected.

**2 — Select or switch org** — reissues the access token only

```
POST /api/login-org   { orgId }          (authenticated by the access cookie)
  → UPDATE user_session SET org_id = $orgId
  ← Set-Cookie: access    (new JWT — now carries orgId + org-granted pp claims)
  ← body: { success, user, templatePermissions, orgList }
```

Same session, same refresh token: the org is a field on the existing row, not a new session. That is what lets renewal reproduce the right org later, and it runs again unchanged whenever the user switches org or picks "no organisation".

**3 — Renewal** — new JWT, session extended

```
request arrives, access cookie expired
  → middleware: verify → expired
  → read refresh cookie → look up session → still exists?
  → getUserInfo({ user_id, org_id, session_id })   ← all three from the session row
  → mint new JWT
  ← Set-Cookie: access     (replaced)
  → rewrite Authorization header so PostGraphile sees the new token
  → UPDATE user_session SET expires_at = now + <session lifetime>
```

The client is never involved. Because renewal can fire on any request, the refresh cookie is `Path=/` rather than scoped to one endpoint.

**4 — Session end**

```
scheduled job, every minute
  → DELETE FROM user_session WHERE expires_at < now()
  → for each deleted session holding a live socket: send { type: 'session-expired' }

POST /api/logout       → DELETE this session row
POST /api/logout-all   → DELETE all rows for this user_id
                         (shared public account: collapses to /logout — §6)
both                   ← Set-Cookie: access & refresh, expired
```

**5 — Machine client** (mSupply, or a peer Conforma server)

```
POST /api/public/login   { <durable credential> }
  ← access token  (same shape, same claims, same RLS)
  ← org comes from the session row — NULL or set, no branch either way

on rejection → present the durable credential again, exactly once
```

## Why it is shaped this way

### 1. A real `exp`, verified by both surfaces

```ts
const getSignedJWT = async (JWTelements: object) =>
  await signPromise(compileJWT(JWTelements), config.jwtSecret, {
    expiresIn: config.accessTokenTtl ?? DEFAULT_ACCESS_TOKEN_TTL,
  })
```

PostGraphile then enforces expiry with no config change — `jsonwebtoken.verify` already rejects on `exp` and PostGraphile already calls it. The manual arithmetic in the preValidation hook is **deleted**, not kept as a fallback, and the `isProductionBuild` gate goes with it: one expiry rule, one place, dev and prod alike.

`getAdminJWT()` is deliberately untouched and stays unexpiring — worth stating plainly, because it is a plausible target for later cleanup. It issues an **immortal superuser token, cached for the life of the process** ([`graphQLConnect.ts:20`](../../src/components/database/graphQLConnect.ts#L20), [`FigTree.ts:30`](../../src/components/fig-tree-evaluator/FigTree.ts#L30)); if it ever gains an expiry, both cache sites need re-acquisition logic or internal GraphQL starts failing after the TTL.

### 2. The session table

```
user_session (
  token_hash  varchar     primary key,       -- exactly one live token per session
  user_id     bigint      not null references "user",
  org_id      bigint      null     references organisation,
  session_id  varchar     not null,          -- the JWT claim; deliberately NOT unique
  expires_at  timestamptz not null
)
index on user_id      -- logout-all
index on expires_at   -- the once-a-minute sweep
```

The refresh token is stored **hashed**, and that hash is the primary key: a session has exactly one live token by construction, and renewal is `WHERE token_hash = $1`, so the key's own index is the hot-path index — no surrogate `id` and no second index. There is no `revoked_at`, `created_at` or `user_agent` either: **revocation is row deletion**, and we accept keeping no audit trail of when or why a session ended. A useful side effect is that revoked, expired and never-existed all collapse to "no row" → 401, so nothing is distinguishable from outside.

**The refresh token is issued once, at login, and never reissued.** Renewal replaces only the access cookie and extends `expires_at`; the refresh cookie is untouched. The token carries no expiry of its own — the row does — so extending the row extends the session and the same key still resolves to it. Rotating it would be actively harmful here: silent renewal fires on *any* request, a single-page app routinely has several in flight, and two that hit the expired-access path together would both rotate — the second presenting an already-used token, which is indistinguishable from theft. What rotation buys is replay detection, and the vectors that enables are the ones the cookie transport already closes (`HttpOnly`, `Secure`, `SameSite=Strict`, and no token in any response body).

**`session_id` is not unique, and must not be given a unique constraint.** The client supplies it at login — the email-link flow posts `?sessionId=` straight into `/api/public/login` so an applicant can resume a form (§6) — so opening that link on a phone and a laptop yields two live sessions sharing one `(user_id, session_id)`. It identifies an *applicant*, never a login.

**Two tokens, not one — and not for leak isolation.** Both live in the same cookie jar under the same flags, so any vector reaching one reaches the other. The split is structural: the access token **must** be a JWT, because every RLS policy is driven by `current_setting('jwt.claims.pp<policyId>')` and a session identifier cannot drive RLS; the refresh token **cannot** be a JWT, because its job is to be looked up in a table and deleted. It also keeps the access token **stateless** — the signature is the whole check, so only renewal touches the session table, not every GraphQL query.

**Why the row carries `org_id`.** `getUserInfo` merges org-granted permissions when an `orgId` is present ([`loginHelpers.ts:97`](../../src/components/permissions/loginHelpers.ts#L97)), so org is authorization state RLS reads, not a display preference. Today it survives renewal by accident — `routeUserInfo` reads `orgId` off the token being presented. Renewal now starts from the session row, so without `org_id` there a silent renewal would drop the user back to no-org mid-session.

**Why the row carries `session_id`.** This is the JWT's `sessionId` claim, and it is load-bearing for public forms — RLS evaluates it on every read (§6). Renewal must reproduce it byte-exactly, or an anonymous applicant loses authorization to their own in-progress application. It is a distinct concept from the row itself: a row is one *login*, whereas `session_id` identifies an *applicant* and may be shared across several.

**Multiple concurrent sessions per user are required.** No unique index on `user_id` — logging in from a second browser must not evict the first. Org is not part of identity either, since switching org updates `org_id` on the same row.

**A database table rather than an in-memory store.** In-memory would log everyone out on every restart — every dev reload and every production deploy — and revocation that does not survive a restart is not revocation. Persistence also costs little here: [`scheduler.ts`](../../src/components/scheduler.ts) already exists to run the cleanup, and it does double duty as the expiry notifier (§5).

### 3. Transport: both tokens as cookies

```
access token   → Set-Cookie, HttpOnly, Secure, SameSite=Strict, Path=/
refresh token  → Set-Cookie, HttpOnly, Secure, SameSite=Strict, Path=/
```

**No endpoint ever returns a token in a response body — login included.** Tokens are delivered exclusively by `Set-Cookie`. This withholds the **token and nothing else**: `user`, `templatePermissions` and `orgList` keep coming back in the body exactly as now; only the `JWT` field goes. Without the rule, injected script calls a renewal endpoint, the cookie is attached automatically, and it reads a valid token out of the body — at which point `HttpOnly` provides no protection at all.

PostGraphile 4 reads the JWT *only* from `Authorization: Bearer` (`authorizationBearerRex`, [`createPostGraphileHttpRequestHandler.js:950`](../../node_modules/postgraphile/build/postgraphile/http/createPostGraphileHttpRequestHandler.js#L950)); library mode offers no cookie source. So a middleware in front of it reads the access cookie and sets that header. The translation half should stay trivial — read one cookie, set one header, touch nothing else — with the renewal logic beside it rather than tangled into it. `/graphql` currently sits entirely outside the `/api` preValidation hook, so this is the first code of ours in the GraphQL auth path, and that is the main cost of this choice.

**State the security limit honestly.** Injected script can still *use* the cookie: the browser attaches it, so it can act as the user for as long as the page lives. What it cannot do is lift a portable credential and replay it later or elsewhere. Session-bound rather than exfiltratable — a real gain, not "XSS is handled".

Two consequences. **CSRF now applies to the whole surface**, since every API and GraphQL request is cookie-authenticated: `SameSite=Strict` covers it, `Lax` does not, because PostGraphile answers GET queries and those would become forgeable. And **in development the web app and server are different origins**, so locally the cookies need `SameSite=None; Secure` plus CORS credentials.

Two web-app clean-ups fall out: `updateFigTree(JWT)` goes away entirely — there is no token to give it — provided FigTree's own fetch is made with credentials so the browser attaches the cookie; and nothing else needs replacing, because the client never reads a claim (no `jwt-decode`, no `atob`), taking `orgList`, `user`, `isAdmin` and `templatePermissions` from response bodies and treating the token as opaque.

### 4. Machine clients are ordinary users

mSupply — and a peer Conforma server — get a **dedicated non-admin service account**, authorised by the same RLS policies as any human user. No `api_key` table, no second identity model, no new branch in the auth hook. `/data-views` already gates on `permissionNames` via `getAllowedDataViews(permissionNames)` ([`data_display/routes.ts:29`](../../src/components/data_display/routes.ts#L29)), so scoping the service user to the registered-products view needs no data-view changes.

The **non-admin** part is the guardrail, not a detail: `isAdmin` sets `role: 'postgres'` and bypasses every RLS policy, so an admin service account is a permanent superuser credential in a partner's config file.

**They may use the identical mechanism.** Nothing stops a machine client keeping a cookie jar and renewing exactly as a browser does. They simply do not need to: re-presenting a durable credential is one call, so the cookie transport and the silent-renewal middleware buy them nothing. **Exactly one retry** on re-authentication, or a bad credential produces repeated failed logins against whatever lockout policy applies.

**Org scope is a configuration choice.** The account can run without an organisation — no dummy org is needed — provided its permission is granted to the service *user* with no org attached. `getUserOrgPermissionNames` ([`postgresConnect.ts:1360`](../../src/components/database/postgresConnect.ts#L1360)) resolves `WHERE ("userId" = $1) AND "orgId" IS NULL` for a no-org session, and `WHERE ("userId" = $1 OR "userId" IS NULL) AND "orgId" = $2` when an org is set, so a `permission_join` row carrying an `org_id` is not returned to a no-org session. If the grant is wired through an organisation instead, login still succeeds and the data-view list comes back empty.

### 5. Renewal is reactive, and there are two clocks

| Clock | What it means | Lifetime | When it changes |
| --- | --- | --- | --- |
| access token `exp` | how long a stateless token is honoured | short — minutes | set at mint, never updated; a new token is minted instead |
| session `expires_at` | the inactivity window | `logoutAfterInactivity` — may be days on deployments that expect no auto-timeout | **extended every time an access token is minted** |
| session `expires_at`, shared public account | same | **1 day** | same (§6) |

Extending on mint rather than on every request is the point: one database write per access-TTL per active session, not one per request. Renewal is triggered by **rejection, not by a schedule**, so the `setInterval`, the clock-driven renewal window, and any focus- or visibility-based triggers all disappear.

**"Active" must mean user activity, not requests.** The server only sees requests, so a user typing into a long form for twenty minutes would be logged out while actively working — a regression, because today's `LoginInactivityTimer` watches mouse and keyboard. It therefore stays, but changes job: instead of logging the user out, it fires a **debounced** lightweight renewal when the user is interacting and nothing has gone to the server. The debounce matters — this must not become a request per keystroke.

**Expiry is pushed, not polled by the client.** An idle client makes no requests, so nothing would tell it the session ended. The once-a-minute cleanup job that deletes expired rows also emits a `session-expired` event to any live socket for those sessions, over the existing `@fastify/websocket` setup ([`routeServerStatus.ts`](../../src/components/other/routeServerStatus.ts), consumed by `ServerStatusListener`). Up to sixty seconds of lag is immaterial here. One gap to close: the current broadcast goes to **every** client (`websocketServer.clients.forEach`) and the socket route does not authenticate, so connections must be tagged with their session at connect time — with cookie transport the handshake carries the cookie, so identifying the connection is free.

**Logout becomes a server call.** Today the web app only flushes local storage. `POST /api/logout` deletes the current session; `POST /api/logout-all` deletes every session for that user. Both must also send expired `Set-Cookie` headers, or the browser keeps presenting a cookie whose row is gone. Note the deliberate asymmetry: **logging in elsewhere revokes nothing** — multiple browsers must keep working — while an explicit logout does.

### 6. Public forms and the shared account

Public forms (UserRegistration, PasswordReset) are not anonymous in the database. The web app logs in as a **single shared real user** — `config.nonRegisteredUser`, with an empty password ([`NonRegisteredLogin.tsx:41`](../../../conforma-web-app/src/containers/User/NonRegisteredLogin.tsx#L41)) — and every public applicant shares that `user_id`. What separates one applicant from the next is **only the `sessionId`**, written onto `application.session_id` at creation ([`useCreateApplication.tsx:42`](../../../conforma-web-app/src/utils/hooks/useCreateApplication.tsx#L42)).

That separation is enforced by RLS, not by application code. The `applyNonRegistered` policy ([`01_permission_policies.js:15`](../../database/insertData/_common/01_permission_policies.js#L15)) compiles to:

```sql
view_pp1 USING (
  COALESCE(current_setting('jwt.claims.pp1', true), '') <> ''
  AND user_id = 1
  AND session_id::text = COALESCE(current_setting('jwt.claims.sessionId', true), '')
  AND template_id = ANY(...)
)
```

So `sessionId` is **an access-control input evaluated by Postgres on every read**, which is why §2 puts it on the session row and why renewal must reproduce it exactly. Mint a fresh one on renewal and the applicant does not merely lose their place — they lose authorization to their own in-progress application, mid-form.

**Public sessions expire after one day**, rather than the longer window a deployment may set for staff. Two reasons: every hit on a public form URL creates a row, bots included, so short-lived rows keep the table honest; and a shared account should not hold multi-day sessions.

**`logout-all` must not fire on this account.** Every public applicant shares one `user_id`, so deleting all sessions for that user would end every in-progress public form on the system at once. It collapses to `logout` instead — a defined behaviour rather than an exclusion, so it cannot be invoked by accident.

**Identifying the account reuses an invariant that already exists.** The shared user is seeded first specifically so that it always has `user_id = 1` ([`02B_nonRegisteredUser.js`](../../database/insertData/_common/02B_nonRegisteredUser.js) — _"Add nonRegisterd first, so it always gets ID 1"_), which is what the policy above relies on; `migrateData` separately identifies it by `username` ([`migrateData.ts:1542`](../../database/migration/migrateData.ts#L1542)). The server keys off the same invariant, named once in `constants.ts` rather than inlined at each use. No new column and no new preference — a flag on the `user` row would be a fourth encoding of a fact the codebase already states three times, and remains cheap to add later if a second shared account ever appears.

Two adjacent findings, both pre-existing and out of scope, recorded so they do not read as considered-and-accepted. The `sessionId` is a **bearer capability**: anyone can log in as the shared account with any `sessionId` and RLS will honour it. It is a `nanoid(16)`, so unguessable, and it travels in email links — the same trust model as a password-reset link — but it never expires and lands in browser history. And the policy carries `# TO-DO: Add CREATE and UPDATE restrictions`, so isolation between public applicants is **read-only** today, consistent with the permissive-write gotcha noted in the permissions guide.

One consequence to design around: because a fresh public form mints its `sessionId` at login and never puts it in the URL, session expiry **orphans the in-progress application permanently** — re-logging in produces a new `sessionId`, and RLS then hides the old one. The cheap fix is to put the `sessionId` into the URL once a public session starts, which is the mechanism the email-link flow already relies on.

### 7. `externalApiConfigs` supports credentials that expire

Conforma-as-client must handle a credential it has to fetch and that later stops working, whatever software is on the far end. Knowing the far end is often Conforma means a preset, not the removal of the problem.

**(a) Widen the auth union** ([`external-apis/types.ts`](../../src/components/external-apis/types.ts)). `Basic` and `Bearer` are untouched — a static shared secret is still right for plenty of APIs:

```ts
type ApiAuthentication =
  | { type: 'Basic';  username: string; password: string }   // unchanged
  | { type: 'Bearer'; token: string }                        // unchanged
  | { type: 'ConformaLogin'                                  // peer Conforma server
      baseUrl: string; username: string; password: string }
  | { type: 'LoginEndpoint'                                  // general case, e.g. mSupply
      loginUrl: string
      body: QueryParameters          // FigTree-evaluable, so env.* works
      tokenPath: string              // lodash path, e.g. 'data.token'
      expiryPath?: string
      defaultTtlSeconds?: number
      headerTemplate?: string }      // default 'Bearer {{token}}'
```

`ConformaLogin` is `LoginEndpoint` with everything known: POST `/api/public/login`, read the token. The union should stay open to `ApiKey` and `OAuth2ClientCredentials` shapes, but neither is being built.

**(b) Cache the token, and share one login between callers that arrive together** — `tokenManager.ts` exposing `getToken(apiName, authConfig)` over an in-memory `Map<name, { token, expiresAt, inFlight?: Promise<string> }>`, with a 60 s safety margin. If twenty relay requests arrive at once just after the cached token expired, the obvious cache starts twenty logins: each checks the cache, finds nothing usable, and begins its own before any has finished. So the map holds the **login already in progress** (`inFlight`), stored before the first `await`. One login, twenty waiters — without it, this is the "hammer each other's server for every little user interaction" failure #342's Challenge 3 names. In-memory rather than persisted: one process today, and it keeps third-party tokens out of snapshots and backups.

**(c) Exactly one retry on 401/403.** Expiry metadata from a remote API is advisory — often absent, sometimes wrong, always subject to server-side revocation — so its rejection is the only authoritative signal. Bounded to one retry, and **only for acquired types**: a 401 on static `Basic`/`Bearer` is a configuration error.

**(d) All of this is invisible to the relay's own caller.** Acquisition, caching and the retry happen inside `routeAccessExternalApi`; the front end makes one request and gets one correct response, whatever re-authentication had to happen behind it.

**(e) Secrets stay out of `preferences.json`.** It is editable through the admin prefs UI and lands in a JSON file that snapshots and template exports may carry, so `password` and `token` fields should require `env.` indirection, or at minimum warn on a literal.

## Open question: what durable credential a machine client holds

Settled in §4 and unaffected by this: mSupply is a **dedicated non-admin service account**, authorised by the same RLS policies as anyone else, holding exactly one durable secret and re-authenticating when it is rejected. Only the *kind* of secret is open — and because both options sit on the same service account, switching later costs a config change at the mSupply end and nothing structural at ours.

### Option A — username and password

- **No new mechanism.** No provisioning route, no admin UI; it is the login path that already exists.
- **Recovery is an existing flow** — an admin resets the password, the operator updates mSupply's config.
- **The credential is more powerful than the job needs.** A password also grants web UI login, so a leak is full account takeover rather than API access. It is also what password-rotation policies target, and a routine rotation silently breaks the integration.
- **Revocation is coarse** — disable the account or change the password; there is no way to cut one integration while leaving the account usable.
- **Re-authentication forks on org scope.** `/api/public/login` always returns a *no-org* token, so an org-scoped service account must follow it with `/api/login-org` — a conditional second step the integrator has to implement and keep correct.

### Option B — a provisioned, non-rotating session credential

An admin mints a long-lived `user_session` row and shows the token once; mSupply stores that instead of a password. No `api_key` table and no second verification path — this is the API-key idea implemented on machinery §2 already builds.

- **API-only.** It cannot log into the web UI, so a leak is bounded to what the service account can read.
- **Individually revocable.** Deleting one row cuts one integration without touching the account or any other client — the capability Option A cannot offer at all.
- **Re-authentication is one call regardless of org scope**, because the session row carries `org_id`. The integrator's client is identical either way and never needs to know which mode it is in.
- **It does not rotate**, consistently with §2 — and here that matters more than for a browser: a crash between receiving a replacement and persisting it would leave mSupply with no credential and, having no password, no self-service recovery. A grace window over two valid tokens is not available as a fallback, since `token_hash` is the primary key and a session holds exactly one.
- **Cost: a provisioning path** — an admin route or UI to mint the credential and display it once, plus a documented re-provisioning procedure, because recovery is out-of-band.

### Where the review stands

**Review so far leans A**, on the grounds that another server being "just another user" is not a problem, with the pull toward B being that it can be long-lived without re-authenticating.

That last argument does dissolve if session lifetimes run to days, as they would on a deployment that expects no auto-timeout — so it should not be the deciding factor either way. What survives is narrower: B's credential cannot log into the web UI, and B can be revoked in isolation. **Long sessions arguably strengthen B rather than A** — a leaked credential that lives for days is one you want to be able to withdraw without disabling the account.

Both are defensible; this needs a decision, not more analysis.

## Rejected alternatives

- **Ship `exp` now and defer the session table.** Attractive on sequencing — `exp` is a one-liner, the session table is a migration across two repos. Rejected because `exp` without a session makes a lapse *unrecoverable*, which forces compensating client machinery (focus-triggered refresh, `exp`-derived scheduling, careful never-let-it-lapse logic) whose entire purpose evaporates the moment §2 lands. Doing both together is less total work than doing them in order.
- **Access token in a header, renewed by the client** (a `/refresh` call plus a 401 interceptor). The genuine alternative to §3, and it keeps two real advantages: no code of ours in the GraphQL auth path, and CSRF confined to a single route. Rejected because it always leaves a portable credential in the browser and merely shortens its life, whereas the cookie transport removes the class of exposure. The cost — a middleware whose translation half is a few lines, in a path we can test directly — is one-time and inspectable.
- **Access token in a header, renewed by the server via a response header** (`X-New-Access-Token`, client swaps it in). Raised in review as a way to keep silent renewal without cookies, and it is possible: HTTP simply has no way for a server to update a client's *header* state, so the client must participate — about ten lines, far less than the option above. Rejected as dominated: it needs the **same** middleware in front of PostGraphile, the refresh cookie still cannot be path-scoped, **and** a portable credential is back in JavaScript. Its one real advantage over §3 is that CSRF stays confined to `/refresh`.
- **Reuse or share JWTs between Conforma instances.** Superficially appealing once the far end is known to be Conforma. Rejected on two independent grounds: instances have different `JWT_SECRET`s (sharing one lets either forge the other's tokens; avoiding that means moving to a scheme where each server signs with its own private key and publishes a matching public one, and then distributing those keys), and **the payload is not portable** — `pp<policyId>` claims are database primary keys, so server A's `pp3` is a different policy on server B, or none. Conforma→Conforma is therefore just a normal client login, which is what `ConformaLogin` is.

## Consequences

- **Tokens expire everywhere, including GraphQL and including dev.** Anything holding a Conforma JWT longer than the access TTL — scripts, saved Postman requests, long-lived dev sessions — starts failing, correctly. Internal `getAdminJWT()` callers are unaffected by design.
- **Two lifetimes now exist where there was one.** Anything reasoning about `logoutAfterInactivity` as a token property — the web app's `tokenExpiry`, the prefs UI — needs re-pointing at the session, and the shared public account needs its own shorter value.
- **The two-step login survives, but step two changes shape.** `POST /api/login-org` becomes a session update rather than a token trade, and the server — not whichever token the client happens to hold — becomes authoritative about which org a session is in.
- **`sessionId` keeps its current meaning and its current API.** It stays a JWT claim, still settable by the client at login, still written onto `application.session_id`. This work adds a column to carry it across renewal; it does not repurpose it. The claim in [`src/components/permissions/CLAUDE.md`](../../src/components/permissions/CLAUDE.md) that it "lets the server invalidate a token if the user logs in elsewhere" is wrong and should be corrected — not implemented, since logging in elsewhere must *not* invalidate anything.
- **The web app gains a logout request and loses its token handling.** Logout stops being a local flush; `updateFigTree` and the `localStorage` token both go.
- **CSRF applies to the whole surface**, where nothing is cookie-authenticated today. `SameSite=Strict` is load-bearing, and GraphQL over GET must stay unreachable cross-site.
- **Local development needs cookie handling.** Different origins in dev means `SameSite=None; Secure` plus CORS credentials — a setup cost and a divergence from production worth documenting rather than discovering.
- **`externalApiConfigs` gains state.** The relay stops being a pure per-request function of config. A credential change may not take effect until the cached token expires — invalidate on prefs reload, [`refreshConfig.ts`](../../src/refreshConfig.ts) is the hook — and acquisition failure is a new failure mode that must not echo a login response body into logs or to the client.
- **Two adjacent bugs fall out of touching `constructAuthHeader`**: `getEnvVariableReplacement` is applied to `Basic.password` but not `Basic.username`, so `username: "env.FOO"` is sent literally; and the `Bearer` branch assigns `axiosRequest.headers = {...}` rather than merging, clobbering any `additionalAxiosProperties.headers`.
- **Suggested order:** §1 + §2 + §3 together (they are one change — `exp` is not safe to ship alone) → §5 → §6 → §4 (unblocks mSupply → Conforma) → §7 (unblocks Conforma → mSupply, #342's "little tweaking").
- **Re-openable** if a third-party integrator list appears (revisit a dedicated key table with rate limiting, and OAuth2 client-credentials for inbound), or if Conforma is deployed multi-instance (the in-memory token cache becomes one login per instance — still correct, but a shared cache may be worth it).
