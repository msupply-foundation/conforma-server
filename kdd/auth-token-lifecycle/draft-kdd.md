# KDD: Authentication refactor

**Status:** Draft (2026-09-02)
**Decision:**

- **Add an `exp` claim to the JWT**, so REST and GraphQL both reject expired tokens through the same check — replacing REST's hand-rolled expiry calculation, which GraphQL never had (§1).
- **A `user_session` table backs browser sessions** — a refresh token held in a cookie JavaScript cannot read, exchanged for a new access token when the old one runs out. Revocation is row deletion (§2).
- **Both tokens are HttpOnly cookies.** A thin middleware in front of PostGraphile translates the access cookie into an `Authorization: Bearer` header, and renews it silently when it has expired, so no token ever enters JavaScript and no endpoint returns one in a response body (§3).
- **Machine clients (mSupply, a peer Conforma server) are ordinary users** — a dedicated non-admin service account holding one admin-provisioned, long-lived session credential. It sends that as its refresh cookie and never logs in: a **missing** access token is treated exactly as an expired one, so the ordinary renewal path serves it with no machine-specific code (§4).
- **Renewal is triggered by rejection, not by a clock**, and extends the session each time a token is minted. Expiry is pushed to idle clients over the existing websocket (§5).
- **Public forms keep working unchanged.** They share one account and are isolated from each other by an RLS policy on `sessionId`, which makes that claim an access-control input the session must preserve exactly (§6).
- **`externalApiConfigs` supports credentials that expire** — Conforma can log in to an external API, reuse the token, and acquire a fresh one when that API rejects it, invisibly to its own caller (§7).

> Driven by [conforma-templates#342](https://github.com/msupply-foundation/conforma-templates/issues/342) (mSupply ↔ Conforma bidirectional integration), whose Challenge 1 is exactly this question in both directions: _"What authorization schemes does each of these APIs use, and how do we persist login info while allowing for re-login if necessary?"_ Background: [`src/components/permissions/CLAUDE.md`](../../src/components/permissions/CLAUDE.md) and [`documentation/External-API-Access.md`](../../documentation/External-API-Access.md).

## Context

Conforma's auth was built for one caller — a human in a browser. Login signs a JWT ([`loginHelpers.ts:116`](../../src/components/permissions/loginHelpers.ts#L116)) carrying `userId`/`orgId`/`sessionId`, `isAdmin`, and the `pp<policyId>` claims that RLS reads ([`rowLevelPolicyHelpers.ts:35`](../../src/components/permissions/rowLevelPolicyHelpers.ts#L35)). #342 adds a machine caller in each direction, which is what forced this KDD. Four things are wrong or missing.

- **The JWT has no `exp`, and the two surfaces diverge as a result.** [`getSignedJWT`](../../src/components/permissions/loginHelpers.ts#L160) signs with no options, so the only time data is the `iat` jsonwebtoken adds automatically. REST *does* expire tokens, but not via the JWT — the `preValidation` hook recomputes the deadline itself, `iat * 1000 + logoutAfterInactivity * 60_000` ([`server.ts:160`](../../src/server.ts#L160)), and only when `config.isProductionBuild`. **GraphQL expires nothing, anywhere**: PostGraphile's only check is `jsonwebtoken.verify`, which rejects on `exp`, and there is none. GraphQL is the entire data surface, so in practice a leaked Conforma JWT has never expired.
- **Nothing is revocable.** No session state exists server-side, so a token cannot be withdrawn once issued. Changing `JWT_SECRET` is the only kill switch, and it logs out everyone. (`sessionId` does **not** serve this purpose — see §6; it identifies an applicant, not a login.)
- **The access token is its own renewal credential, so a lapse is unrecoverable.** Renewal means presenting the still-valid token to `/api/user-info`; once expired there is nothing left to present. A `setInterval` ([`UserState.tsx:167`](../../../conforma-web-app/src/contexts/UserState/UserState.tsx#L167)) is therefore the only thing between a user and a logout — and browsers throttle background-tab timers and freeze them once a tab has been hidden a while.
- **Server-as-client can only hold a fixed secret.** The relay at `POST /api/external-api/:name/:route` ([`server.ts:368`](../../src/server.ts#L368)) supports `Basic` or `Bearer` only ([`external-apis/types.ts:3`](../../src/components/external-apis/types.ts#L3)), applied verbatim by [`constructAuthHeader`](../../src/components/external-apis/helpers.ts#L9). No OAuth2, no re-login, no 401 handling anywhere in the codebase. But mSupply hands out a session token from a login call — a credential that expires, which the config cannot express. §7 adds that: a username/password auth type that performs its own login step transparently when not currently authenticated.

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

POST /api/logout       → DELETE all rows for this user_id
                         (shared public account: this row only — §6)
                       ← Set-Cookie: access & refresh, expired
```

**5 — Machine client** (mSupply, or a peer Conforma server)

```
one-time: an admin provisions a long-lived user_session row for the service
          account and shows the token once

every request →  Cookie: refresh=<provisioned token>     (no access cookie)
  → middleware: no access token — treated exactly as expired
  → look up session → still exists?
  → mint access token, set it on the response, continue
```

No login call, no credentials, no token handling: the client sends one value and
the server does the rest through the ordinary renewal path.

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

**Snapshots skip it on export, and carry exactly one row across on import.** Sessions are local state, not data. A snapshot may be restored onto a different client's system entirely, so its sessions must not travel with it — but the admin who *triggers* a restore should not be logged out by their own action. The two halves need different mechanisms, and only one is a `pg_dump` flag.

*Export* is a flag: [`takeSnapshot.ts:52`](../../src/components/snapshots/takeSnapshot.ts#L52) gains `--exclude-table-data=public.user_session`, which omits the rows while still dumping the table definition. (`--exclude-table` would drop the definition too, so a restore would not recreate it.)

*Import* is not, and no restore flag can help: [`useSnapshot.ts:84`](../../src/components/snapshots/useSnapshot.ts#L84) deliberately runs `DROP SCHEMA public CASCADE` before `pg_restore`, so nothing in `public` survives. Instead, at the start of `useSnapshot` the **restoring admin's own session row is read out, together with their username**, and re-inserted afterwards. Nothing else is preserved.

**It is re-resolved by username, not re-inserted verbatim.** A restore replaces the whole dataset, so the stored `user_id` may now identify a different person — the hazard `routeUserInfo` already guards against by re-checking the JWT's username against a fresh lookup. So the row goes back only if that username exists in the restored data, rewritten to whatever `user_id` it now has, with `org_id` cleared so the org is re-picked. If the username is absent, nothing is re-inserted and the admin logs in against the restored system, which is the honest outcome — they have no account on it. That case is already recoverable on non-live servers through the existing `USER_PASSWORD_OVERRIDE` reset ([`migrateData.ts:1535`](../../database/migration/migrateData.ts#L1535)).

This is a correctness measure rather than a security one: `useSnapshot` is admin-only, and `isAdmin` already carries `role: 'postgres'`, so the actor cannot gain access they lack. What it prevents is an admin silently continuing as whichever user now holds that id.

**A database table rather than an in-memory store.** In-memory would log everyone out on every restart — every dev reload and every production deploy — and revocation that does not survive a restart is not revocation. Persistence costs little: the sweep is a plain `setInterval` launched from [`server.ts`](../../src/server.ts), and it does double duty as the expiry notifier (§5). Not [`scheduler.ts`](../../src/components/scheduler.ts) — that exists for customisable, user-editable schedules, and this is a fixed internal poll.

### 3. Transport: both tokens as cookies

```
access token   → Set-Cookie, HttpOnly, Secure, SameSite=Strict, Path=/
refresh token  → Set-Cookie, HttpOnly, Secure, SameSite=Strict, Path=/
```

**No endpoint ever returns a token in a response body — login included.** Tokens are delivered exclusively by `Set-Cookie`. This withholds the **token and nothing else**: `user`, `templatePermissions` and `orgList` keep coming back in the body exactly as now; only the `JWT` field goes. Without the rule, injected script calls a renewal endpoint, the cookie is attached automatically, and it reads a valid token out of the body — at which point `HttpOnly` provides no protection at all.

PostGraphile 4 reads the JWT *only* from `Authorization: Bearer` (`authorizationBearerRex`, [`createPostGraphileHttpRequestHandler.js:950`](../../node_modules/postgraphile/build/postgraphile/http/createPostGraphileHttpRequestHandler.js#L950)); library mode offers no cookie source. So a middleware in front of it reads the access cookie and sets that header. Its renewal rule is *"no usable access token, but a live session → mint one"*, where **missing and expired are the same case** — which is what lets a machine client work with no code of its own (§4). The translation half should stay trivial — read one cookie, set one header, touch nothing else — with the renewal logic beside it rather than tangled into it. `/graphql` currently sits entirely outside the `/api` preValidation hook, so this is the first code of ours in the GraphQL auth path, and that is the main cost of this choice.

**State the security limit honestly.** Injected script can still *use* the cookie: the browser attaches it, so it can act as the user for as long as the page lives. What it cannot do is lift a portable credential and replay it later or elsewhere. Session-bound rather than exfiltratable — a real gain, not "XSS is handled".

Two consequences. **CSRF now applies to the whole surface**, since every API and GraphQL request is cookie-authenticated: `SameSite=Strict` covers it, `Lax` does not, because PostGraphile answers GET queries and those would become forgeable. And **in development the web app and server are different origins**, so locally the cookies need `SameSite=None; Secure` plus CORS credentials.

Two web-app clean-ups fall out: `updateFigTree(JWT)` goes away entirely — there is no token to give it — provided FigTree's own fetch is made with credentials so the browser attaches the cookie; and nothing else needs replacing, because the client never reads a claim (no `jwt-decode`, no `atob`), taking `orgList`, `user`, `isAdmin` and `templatePermissions` from response bodies and treating the token as opaque.

### 4. Machine clients are ordinary users

mSupply — and a peer Conforma server — get a **dedicated non-admin service account**, authorised by the same RLS policies as any human user. No `api_key` table, no second identity model, no new branch in the auth hook. `/data-views` already gates on `permissionNames` via `getAllowedDataViews(permissionNames)` ([`data_display/routes.ts:29`](../../src/components/data_display/routes.ts#L29)), so scoping the service user to the registered-products view needs no data-view changes.

The **non-admin** part is the guardrail, not a detail: `isAdmin` sets `role: 'postgres'` and bypasses every RLS policy, so an admin service account is a permanent superuser credential in a partner's config file.

**The credential is a provisioned long-lived session, not a password.** An admin — and only an admin — creates a `user_session` row for the service account with a far-future `expires_at`, and the token is shown once. mSupply stores that single value and sends it as the refresh cookie on every request. There is no login call, no username or password at its end, and no token lifecycle for it to implement: its entire configuration is a base URL and one token.

**Absence of an access token is treated exactly as expiry.** That is the whole mechanism, and the reason no machine-specific code exists. The middleware's rule is *"no usable access token, but a live session → mint one"*, and a request that never carried an access cookie satisfies it identically to one whose cookie has aged out. A machine client is therefore not a case the auth path knows about; it is the same path with one branch already true.

A client that keeps a cookie jar picks up the minted access token and behaves exactly like a browser. One that ignores `Set-Cookie` simply has a token minted per request — an indexed lookup and a signature, with no bcrypt anywhere, so the degradation is cheap and needs no special handling either.

Revocation is deleting that row, which cuts the integration without touching the account. The credential cannot log into the web UI, and it does not rotate: a crash between receiving a replacement and persisting it would leave the client with nothing and no self-service recovery, and a grace window over two tokens is unavailable since `token_hash` is the primary key.

**Org scope is a configuration choice.** The account can run without an organisation — no dummy org is needed — provided its permission is granted to the service *user* with no org attached. `getUserOrgPermissionNames` ([`postgresConnect.ts:1360`](../../src/components/database/postgresConnect.ts#L1360)) resolves `WHERE ("userId" = $1) AND "orgId" IS NULL` for a no-org session, and `WHERE ("userId" = $1 OR "userId" IS NULL) AND "orgId" = $2` when an org is set, so a `permission_join` row carrying an `org_id` is not returned to a no-org session. If the grant is wired through an organisation instead, login still succeeds and the data-view list comes back empty.

### 5. Renewal is reactive, and there are two clocks

| Clock | What it means | Lifetime | When it changes |
| --- | --- | --- | --- |
| access token `exp` | how long a stateless token is honoured | `Math.min(logoutAfterInactivity / 12, 60)` minutes — so a 1 h session gives 5 min, 6 h gives 30 min, and anything from 12 h up is capped at 1 h | set at mint, never updated; a new token is minted instead |
| session `expires_at` | the inactivity window | `logoutAfterInactivity` — may be days on deployments that expect no auto-timeout | **extended every time an access token is minted** |
| session `expires_at`, shared public account | same | **1 day** | same (§6) |

Extending on mint rather than on every request is the point: one database write per access-TTL per active session, not one per request. Renewal is triggered by **rejection, not by a schedule**, so the `setInterval`, the clock-driven renewal window, and any focus- or visibility-based triggers all disappear.

**"Active" must mean user activity, not requests.** The server only sees requests, so a user typing into a long form for twenty minutes would be logged out while actively working — a regression, because today's `LoginInactivityTimer` watches mouse and keyboard. **The existing idle tracker is reused rather than replaced**; it simply changes job. Instead of logging the user out when the deadline passes, it calls `GET /api/user-info` while the user is interacting, which keeps the session alive and — should the access cookie have expired — has it silently replaced by the same middleware as any other request.

For that call to keep the session alive it must extend `expires_at` **whether or not a token was minted**: `/api/user-info` is the designated "still here" call, and is the one place expiry is refreshed without a mint. Everything else extends it only as a side effect of minting.

**The tracker deliberately does not know the access token's expiry**, and needs no new machinery to compensate. Nothing about the token is visible to JavaScript — that is the point of §3, and exposing `exp` in a readable cookie would start unpicking it. It does not need to: calling *periodically while active* keeps the session alive wherever the access token happens to be in its own cycle, and the period itself is what stops this becoming a request per interaction. The cadence comes from `logoutAfterInactivity`, which the front end already receives from `/api/public/get-prefs` and which is not a secret — a few calls per session window is ample. No debouncing and no second monitor: the tracker keeps its current shape and swaps its action.

**Expiry is pushed, not polled by the client.** An idle client makes no requests, so nothing would tell it the session ended. The once-a-minute cleanup job that deletes expired rows also emits a `session-expired` event to any live socket for those sessions, over the existing `@fastify/websocket` setup ([`routeServerStatus.ts`](../../src/components/other/routeServerStatus.ts), consumed by `ServerStatusListener`). It is a plain `setInterval` from `server.ts`, not a `scheduler.ts` job — nothing about it is configurable. Up to sixty seconds of lag is immaterial here. One gap to close: the current broadcast goes to **every** client (`websocketServer.clients.forEach`) and the socket route does not authenticate, so connections must be tagged with their session at connect time. Cookie transport helps — the handshake carries the cookie like any other request, so the server can resolve the session at connect and hold it against the socket.

**If that matching proves fiddly, drop it rather than build around it.** The fallback is to send nothing: a client discovers the ended session on its next request, which 401s and returns it to login. All that is lost is prompt logout of a tab nobody is looking at — which is no worse than today, where the client-side timer is the only thing that notices. Targeted delivery is a refinement on the reactive path, not load-bearing, and should not be allowed to grow complicated.

**Logout becomes a server call.** Today the web app only flushes local storage. A single `POST /api/logout` deletes **every** session for that user — there is one Logout action in the UI and no appetite for a second, so logout means everywhere. It must also send expired `Set-Cookie` headers, or the browser keeps presenting a cookie whose row is gone. Note the deliberate asymmetry: **logging in elsewhere revokes nothing** — multiple browsers must keep working — while an explicit logout ends all of them.

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

Expiring a public session does orphan any in-progress application, since re-logging in mints a new `sessionId` and RLS then hides the old one. That is accepted: `staleApplicationCleanup` ([`scheduler.ts:8`](../../src/components/scheduler.ts#L8)) already removes old never-submitted drafts, so orphans are swept rather than accumulating.

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

**(e) Warn when secrets are written into `preferences.json`.** It is editable through the admin prefs UI and lands in a JSON file that snapshots and template exports may carry, so a literal `password` or `token` should log a warning recommending `env.` indirection. A warning, not a refusal — hard-coding a password there is fine for development and testing.

## Rejected alternatives

- **A username and password for machine clients**, rather than a provisioned session credential. Genuinely cheaper — no provisioning route, no admin UI, and password reset is an existing recovery flow. Rejected on three counts: a password also grants web UI login, so a leak is account takeover rather than API access; it cannot be revoked in isolation, only by disabling the account or changing the password, which a rotation policy may do on its own schedule and silently break the integration; and it forces the client to implement a login call and, if the account is org-scoped, a conditional second call to `/api/login-org`. The provisioned credential removes all three, and the client's whole configuration becomes a base URL and one token.
- **Ship `exp` now and defer the session table.** Attractive on sequencing — `exp` is a one-liner, the session table is a migration across two repos. Rejected because `exp` without a session makes a lapse *unrecoverable*, which forces compensating client machinery (focus-triggered refresh, `exp`-derived scheduling, careful never-let-it-lapse logic) whose entire purpose evaporates the moment §2 lands. Doing both together is less total work than doing them in order.
- **Access token in a header, renewed by the client** (a `/refresh` call plus a 401 interceptor). The genuine alternative to §3, and it keeps two real advantages: no code of ours in the GraphQL auth path, and CSRF confined to a single route. Rejected because it always leaves a portable credential in the browser and merely shortens its life, whereas the cookie transport removes the class of exposure. The cost — a middleware whose translation half is a few lines, in a path we can test directly — is one-time and inspectable.
- **Access token in a header, renewed by the server via a response header** (`X-New-Access-Token`, client swaps it in). Raised in review as a way to keep silent renewal without cookies, and it is possible: HTTP simply has no way for a server to update a client's *header* state, so the client must participate — about ten lines, far less than the option above. Rejected as dominated: it needs the **same** middleware in front of PostGraphile, the refresh cookie still cannot be path-scoped, **and** a portable credential is back in JavaScript. Its one real advantage over §3 is that CSRF stays confined to `/refresh`.
- **Reuse or share JWTs between Conforma instances.** Superficially appealing once the far end is known to be Conforma. Rejected on two independent grounds: instances have different `JWT_SECRET`s (sharing one lets either forge the other's tokens; avoiding that means moving to a scheme where each server signs with its own private key and publishes a matching public one, and then distributing those keys), and **the payload is not portable** — `pp<policyId>` claims are database primary keys, so server A's `pp3` is a different policy on server B, or none. Conforma→Conforma is therefore just a normal client login, which is what `ConformaLogin` is.

## Consequences

- **Tokens expire everywhere, including GraphQL and including dev.** Anything holding a Conforma JWT longer than the access TTL — scripts, saved Postman requests, long-lived dev sessions — starts failing, correctly. Internal `getAdminJWT()` callers are unaffected by design.
- **Two lifetimes now exist where there was one.** Anything reasoning about `logoutAfterInactivity` as a token property — the web app's `tokenExpiry`, the prefs UI — needs re-pointing at the session, and the shared public account needs its own shorter value.
- **The two-step login survives, but step two changes shape.** `POST /api/login-org` becomes a session update rather than a token trade, and the server — not whichever token the client happens to hold — becomes authoritative about which org a session is in.
- **`sessionId` keeps its current meaning and its current API.** It stays a JWT claim, still settable by the client at login, still written onto `application.session_id`. This work adds a column to carry it across renewal; it does not repurpose it. The claim in [`src/components/permissions/CLAUDE.md`](../../src/components/permissions/CLAUDE.md) that it "lets the server invalidate a token if the user logs in elsewhere" is wrong and should be corrected — not implemented, since logging in elsewhere must *not* invalidate anything.
- **Machine access is revoked by deleting its session row**, cutting one integration without touching the account. Revocation is not instant: checking a revocation list per request would mean a database lookup each time, defeating a token that verifies on its own — so latency equals the access TTL.
- **Provisioning is new admin surface.** An admin-only route or UI to mint a service session and display its token once, plus a documented re-provisioning procedure, since recovery is out-of-band.
- **The web app gains a logout request and loses its token handling.** Logout stops being a local flush; `updateFigTree` and the `localStorage` token both go.
- **CSRF applies to the whole surface**, where nothing is cookie-authenticated today. `SameSite=Strict` is load-bearing, and GraphQL over GET must stay unreachable cross-site.
- **Local development needs cookie handling.** Different origins in dev means `SameSite=None; Secure` plus CORS credentials — a setup cost and a divergence from production worth documenting rather than discovering.
- **`externalApiConfigs` gains state.** The relay stops being a pure per-request function of config. A credential change may not take effect until the cached token expires — invalidate on prefs reload, [`refreshConfig.ts`](../../src/refreshConfig.ts) is the hook — and acquisition failure is a new failure mode that must not echo a login response body into logs or to the client.
- **Two adjacent bugs fall out of touching `constructAuthHeader`**: `getEnvVariableReplacement` is applied to `Basic.password` but not `Basic.username`, so `username: "env.FOO"` is sent literally; and the `Bearer` branch assigns `axiosRequest.headers = {...}` rather than merging, clobbering any `additionalAxiosProperties.headers`.
- **Suggested order:** §1 + §2 + §3 together (they are one change — `exp` is not safe to ship alone) → §5 → §6 → §4 (unblocks mSupply → Conforma) → §7 (unblocks Conforma → mSupply, #342's "little tweaking").
- **Re-openable** if a third-party integrator list appears (revisit a dedicated key table with rate limiting, and OAuth2 client-credentials for inbound), or if Conforma is deployed multi-instance (the in-memory token cache becomes one login per instance — still correct, but a shared cache may be worth it).
