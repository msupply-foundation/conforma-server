# KDD: Authentication refactor

**Status:** Draft (2026-09-01)
**Decision:**

- **Add an `exp` claim to the JWT**, so REST and GraphQL both reject expired tokens through the same check — replacing REST's hand-rolled expiry calculation, which GraphQL never had (§1).
- **Browser sessions get a refresh token and a session table** — a second, longer-lived credential held in a cookie JavaScript cannot read, exchanged for a new access token when the old one runs out (§2).
- **The refresh token is always an HttpOnly cookie.** How the *access* token is carried — in a response body and an `Authorization` header, or as a cookie with a thin middleware translating cookie → header in front of PostGraphile — is the first **open question** for review, and it applies to every caller, not only the web app. The lean is the cookie (§3, and [Open question 1](#open-question-1-how-the-access-token-is-carried-and-renewed)).
- **Machine clients (mSupply, a peer Conforma server) are ordinary users** — a dedicated non-admin service account, the same login endpoint, the same access token with the same claims, holding one durable secret and re-authenticating when the server rejects the token. Whether that secret is a password or a provisioned session credential is the **second open question** for review (§4).
- **Renewal is triggered by rejection, not by a clock** — no timers, no scheduled refresh; the session's expiry is the real limit. Who performs it follows from the open question; the leaning answer is the server, silently (§5).
- **`externalApiConfigs` supports credentials that expire** — Conforma can log in to an external API, reuse the token it gets back, and acquire a fresh one when that API rejects it, instead of only ever sending a fixed secret (§6).

> Driven by [conforma-templates#342](https://github.com/msupply-foundation/conforma-templates/issues/342) (mSupply ↔ Conforma bidirectional integration), whose Challenge 1 is exactly this question in both directions: _"What authorization schemes does each of these APIs use, and how do we persist login info while allowing for re-login if necessary?"_ Background: [`src/components/permissions/CLAUDE.md`](../../src/components/permissions/CLAUDE.md) and [`documentation/External-API-Access.md`](../../documentation/External-API-Access.md).

## Context

Conforma's auth was built for one caller — a human in a browser. Login signs a JWT ([`loginHelpers.ts:116`](../../src/components/permissions/loginHelpers.ts#L116)) carrying `userId`/`orgId`/`sessionId`, `isAdmin`, and the `pp<policyId>` claims that RLS reads ([`rowLevelPolicyHelpers.ts:35`](../../src/components/permissions/rowLevelPolicyHelpers.ts#L35)). #342 adds a machine caller in each direction, which is what forced this KDD. Four things are wrong or missing.

- **The JWT has no `exp`, and the two surfaces diverge as a result.** [`getSignedJWT`](../../src/components/permissions/loginHelpers.ts#L160) signs with no options, so the only time data is the `iat` jsonwebtoken adds automatically. REST *does* expire tokens, but not via the JWT — the `preValidation` hook recomputes the deadline itself, `iat * 1000 + logoutAfterInactivity * 60_000` ([`server.ts:160`](../../src/server.ts#L160)), and only when `config.isProductionBuild`. **GraphQL expires nothing, anywhere**: PostGraphile's only check is `jsonwebtoken.verify`, which rejects on `exp`, and there is none. GraphQL is the entire data surface, so in practice a leaked Conforma JWT has never expired.
- **Nothing is revocable.** `sessionId` is a `nanoid(16)` generated at login — or supplied by the client in the login body — embedded in the JWT and never checked against any server-side store. (The `session_id` at [`postgresConnect.ts:630`](../../src/components/database/postgresConnect.ts#L630) is an *application's* session, unrelated.) Changing `JWT_SECRET` is the only kill switch, and it logs out everyone.
- **The access token is its own renewal credential, so a lapse is unrecoverable.** Renewal means presenting the still-valid token to `/api/user-info`; once expired there is nothing left to present. A `setInterval` ([`UserState.tsx:167`](../../../conforma-web-app/src/contexts/UserState/UserState.tsx#L167)) is therefore the only thing between a user and a logout — and browsers throttle background-tab timers and freeze them once a tab has been hidden a while.
- **Server-as-client can only hold a fixed secret.** The relay at `POST /api/external-api/:name/:route` ([`server.ts:368`](../../src/server.ts#L368)) supports `Basic` or `Bearer` only ([`external-apis/types.ts:3`](../../src/components/external-apis/types.ts#L3)), applied verbatim by [`constructAuthHeader`](../../src/components/external-apis/helpers.ts#L11). No OAuth2, no re-login, no 401 handling anywhere in the codebase. But mSupply hands out a session token from a login call — a credential that expires, which the config cannot express.

#342 needs both directions: Conforma calling mSupply's item API, and mSupply calling Conforma's `/data-views` ([`server.ts:360-363`](../../src/server.ts#L360-L363)), which sits in the authenticated tier and so needs a Conforma access token and a way to keep having one.

## The proposed flow

Shown under [Open question 1](#open-question-1-how-the-access-token-is-carried-and-renewed)'s leaning option — both tokens as cookies. Under its Option A the same steps apply, except the access token is returned in the body and presented as `Authorization: Bearer`, and step 3 is performed by the client rather than the server.

**1 — Login with credentials**

```
POST /api/public/login   { username, password }
  → bcrypt check
  → INSERT user_session { user_id, org_id: NULL, token_hash, expires_at }
  ← Set-Cookie: refresh   (HttpOnly, Secure, SameSite=Strict)
  ← Set-Cookie: access    (JWT — user claims only, no orgId)
  ← body: { success, user, templatePermissions, orgList }     ← no tokens
```

`orgList` still comes back in the body as it does today ([`loginHelpers.ts:140`](../../src/components/permissions/loginHelpers.ts#L140)), so the org picker is unaffected.

**2 — Select or switch org** — reissues the access token only

```
POST /api/login-org   { orgId }          (authenticated by the access cookie)
  → read sessionId claim from the verified token
  → UPDATE user_session SET org_id = $orgId
  ← Set-Cookie: access    (new JWT — now carries orgId + org-granted pp claims)
  ← body: { success, user, templatePermissions, orgList }
```

Same session, same refresh token: the org is a field on the existing row, not a new session. That is what lets renewal reproduce the right org later, and it runs again unchanged whenever the user switches org or picks "no organisation".

**3 — Renewal** — new JWT, session extended rather than recreated

```
request arrives, access cookie expired
  → middleware: verify → expired
  → read refresh cookie → look up session → check not revoked, not expired
  → getUserInfo({ user_id, org_id })        ← org comes from the session row
  → mint new JWT
  ← Set-Cookie: access     (replaced)
  → rewrite Authorization header so PostGraphile sees the new token
  → UPDATE user_session SET expires_at = now + logoutAfterInactivity
```

The client is never involved. Because renewal can fire on any request, the refresh cookie must be `Path=/` under this option — see Option B's costs.

**4 — Machine client** (mSupply, or a peer Conforma server)

```
POST /api/public/login   { <durable credential> }
  ← access token  (same shape, same claims, same RLS)
  ← org comes from the session row — NULL or set, no branch either way

on rejection → present the durable credential again, exactly once
```

No refresh cycle and no silent renewal: the client already holds a durable credential, so re-authenticating is one call. What that credential is, is [Open question 2](#open-question-2-what-durable-credential-a-machine-client-holds).

## Why it is shaped this way

### 1. A real `exp`, verified by both surfaces

```ts
const getSignedJWT = async (JWTelements: object) =>
  await signPromise(compileJWT(JWTelements), config.jwtSecret, {
    expiresIn: config.accessTokenTtl ?? DEFAULT_ACCESS_TOKEN_TTL,
  })
```

PostGraphile then enforces expiry with no config change — `jsonwebtoken.verify` already rejects on `exp` and PostGraphile already calls it. The manual arithmetic in the preValidation hook is **deleted**, not kept as a fallback, and the `isProductionBuild` gate goes with it: one expiry rule, one place, dev and prod alike.

**`logoutAfterInactivity` stops governing the access token.** It becomes the session lifetime, where inactivity logout belongs; the access token gets its own short fixed TTL. Letting one number mean both is how the current `logoutAfterInactivity: 1` race exists.

`getAdminJWT()` is deliberately untouched and stays unexpiring — worth stating plainly, because it is a plausible target for later cleanup. It issues an **immortal superuser token, cached for the life of the process** ([`graphQLConnect.ts:20`](../../src/components/database/graphQLConnect.ts#L20), [`FigTree.ts:30`](../../src/components/fig-tree-evaluator/FigTree.ts#L30)); if it ever gains an expiry, both cache sites need re-acquisition logic or internal GraphQL starts failing after the TTL.

### 2. Why a session table, and why two tokens

`user_session (id, user_id, org_id, token_hash, created_at, expires_at, revoked_at, user_agent)`, the refresh token stored **hashed**. `revoked_at` makes "log out everywhere" one UPDATE — the first time any Conforma credential has been revocable without changing `JWT_SECRET` for everyone.

**Two tokens, not one — and not for leak isolation.** In a cookie-only design both live in the same jar under the same flags, so any vector reaching one reaches the other. The split is structural: the access token **must** be a JWT, because every RLS policy is driven by `current_setting('jwt.claims.pp<policyId>')` and a session identifier cannot drive RLS; the refresh token **cannot** be a JWT, because its job is to be looked up in a table and killed. It also keeps the access token **stateless** — the signature is the whole check, so only renewal touches the session table, not every GraphQL query.

**Why `org_id` belongs on the session.** `getUserInfo` merges org-granted permissions when an `orgId` is present ([`loginHelpers.ts:97`](../../src/components/permissions/loginHelpers.ts#L97)), so org is authorization state RLS reads, not a display preference. Today that survives renewal by accident — `routeUserInfo` reads `orgId` off the token being presented. Renewal now starts from the session row, so without `org_id` there a silent renewal would drop the user back to no-org mid-session. No-org is not a special case: it is the same call with `orgId` undefined.

Two consequences. The **client-supplied `sessionId` disappears** — today the client passes one through both login calls to keep continuity across an org switch; with a server-side row that continuity is structural. And **switching org does not instantly invalidate the previous access token**: it stays valid, still carrying the org just left, until `exp`. That is true today and unbounded; here it is bounded by the access TTL, and under Option B the server overwrites the access cookie on switch, so the browser stops holding the old one.

**Not deferred behind §1.** Shipping `exp` without this would mean building additional client-side machinery purely to avoid ever letting a self-renewing token lapse, then deleting it when the session table arrives.

### 3. Transport

The refresh token is **always** an HttpOnly cookie — that is the entire reason it exists, and one readable by JavaScript would be no better than today's long-lived JWT. How the *access* token is carried is [Open question 1](#open-question-1-how-the-access-token-is-carried-and-renewed).

Independent of that choice: in development the web app and server are different origins, so locally the refresh cookie needs `SameSite=None; Secure` plus CORS credentials. And `updateFigTree(JWT)` needs attention either way — under Option A it is a second storage site for the same token and moves with it; under Option B the web app has no token to give it, so it goes away entirely, provided FigTree's own fetch is made with credentials.

### 4. Machine clients are ordinary users

mSupply — and a peer Conforma server — get a **dedicated non-admin service account**, authorised by the same RLS policies as any human user. No `api_key` table, no second identity model, no new branch in the preValidation hook. `/data-views` already gates on `permissionNames` via `getAllowedDataViews(permissionNames)` ([`data_display/routes.ts:29`](../../src/components/data_display/routes.ts#L29)), so scoping the service user to the registered-products view needs no data-view changes.

The **non-admin** part is the guardrail, not a detail: `isAdmin` sets `role: 'postgres'` and bypasses every RLS policy, so an admin service account is a permanent superuser credential in a partner's config file.

**Whether the service account is org-scoped is a configuration choice.** It can run without an organisation — no dummy org is needed — provided its permission is granted to the service *user* with no org attached. `getUserOrgPermissionNames` ([`postgresConnect.ts:1360`](../../src/components/database/postgresConnect.ts#L1360)) resolves `WHERE ("userId" = $1) AND "orgId" IS NULL` for a no-org session, and `WHERE ("userId" = $1 OR "userId" IS NULL) AND "orgId" = $2` when an org is set, so a `permission_join` row carrying an `org_id` is not returned to a no-org session. If the grant is wired through an organisation instead, login still succeeds and the data-view list comes back empty.

**Exactly one retry** on re-authentication, or a bad credential produces repeated failed logins against whatever lockout policy applies.

### 5. Renewal is reactive, and the session is the real clock

Whichever transport wins, renewal is triggered by **rejection, not by a schedule**. The `setInterval`, the clock-driven renewal window, and any focus- or visibility-based triggers all disappear, because a lapsed access token is now a normal condition rather than an unrecoverable one. `LoginInactivityTimer` may stay as a courtesy — warning the user before logout — but it is no longer the mechanism; the session's `expires_at` is.

### 6. `externalApiConfigs` supports credentials that expire

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

**(d) Secrets stay out of `preferences.json`.** It is editable through the admin prefs UI and lands in a JSON file that snapshots and template exports may carry, so `password` and `token` fields should require `env.` indirection, or at minimum warn on a literal.

## Open question 1: how the access token is carried and renewed

Two coherent packages. Everything else in this KDD holds either way. The lean is recorded at the end of this section, but it is a lean, not a decision.

### Option B — access token in an HttpOnly cookie, server renews silently  *(leaning)*

Both tokens are cookies. The web app holds **no credential in JavaScript at all**. A thin middleware in front of PostGraphile reads the access cookie and sets `Authorization: Bearer` on the request — nothing more — and the same layer, on finding the access token expired, validates the refresh cookie, issues a replacement, and sets it on the response. The client never knows a renewal happened.

- **Nothing in JavaScript to steal.** This is the point of the option, and it holds only under a rule with no exceptions: **no endpoint ever returns a token in a response body — login included.** Tokens are delivered exclusively by `Set-Cookie`. To be unambiguous, this withholds the **token and nothing else**: `user`, `templatePermissions` and `orgList` are not credentials and keep coming back in the body exactly as now — only the `JWT` field goes. The org picker, which reads `orgList` from the login/user-info response rather than from the token ([`loginHelpers.ts:140`](../../src/components/permissions/loginHelpers.ts#L140)), is unaffected. The obvious carve-out for login does not survive scrutiny: under this option the cookie is set by the same response, so a body token is something the web app never uses and can only leak, and a single exception makes the rule unenforceable — the version that holds the line is the one with nothing to argue about. Without it, injected script calls `/refresh`, the cookie is attached automatically, and it reads a valid token out of the body — at which point `HttpOnly` provides no protection at all.
- **Smaller than it sounds, because the web app never reads a claim.** There is no `jwt-decode`, no `atob`, no claim inspection anywhere in the client — it takes `orgList`, `user`, `isAdmin` and `templatePermissions` from response bodies and treats the token as an opaque string it stores and forwards. So "the client holds nothing" cascades nowhere: there is no client-side claim-reading to replace with server round-trips, and only two token touch-points exist — `localStorage` and `updateFigTree`.
- **State the limit honestly.** XSS can still *use* the cookie: the browser attaches it, so injected script can act as the user for as long as the page lives. What it cannot do is lift a portable credential and replay it later or elsewhere. Session-bound rather than exfiltratable — a real gain, not "XSS is handled".
- **Cost: a middleware in front of PostGraphile.** PostGraphile 4 reads the JWT *only* from `Authorization: Bearer` (`authorizationBearerRex`, [`createPostGraphileHttpRequestHandler.js:950`](../../node_modules/postgraphile/build/postgraphile/http/createPostGraphileHttpRequestHandler.js#L950)); library mode offers no cookie source. Note this is **not** a cost of silent refresh — it is the price of a cookie-borne access token at all, and would apply even with client-driven renewal. `/graphql` currently sits entirely outside the `/api` preValidation hook, so this is the first code of ours in the GraphQL auth path. Mitigating that: the translation half is genuinely trivial — read one cookie, set one header, touch nothing else — and it should be kept that way, with the renewal logic beside it rather than tangled into it.
- **HttpOnly forces the middleware.** A cookie the web app can read in order to set its own header is exactly as exposed as `localStorage`, so it buys nothing. There is no cheap middle version.
- **CSRF widens to the whole surface.** Every API and GraphQL request becomes cookie-authenticated. `SameSite=Strict` covers it; `Lax` does not, because PostGraphile answers GET queries and those would become forgeable. So: Strict, or GraphQL enforced POST-only.
- **The refresh cookie cannot be path-scoped.** Renewal fires on an ordinary request, so the refresh cookie must be present on every request (`Path=/`) rather than only on `/refresh`. Option A can scope it narrowly; this option cannot, so the durable secret travels with every call.
- **Machine clients need no special case.** They read the token from the `Set-Cookie` header, or simply keep a cookie jar and behave exactly like a browser. Accepting `Authorization: Bearer` as well is a convenience for clients that would rather not keep a jar — not a second mechanism, since the middleware normalises to that header anyway.

### Option A — access token in a header, client renews

The web app keeps the access token in JavaScript (`localStorage`, or a plain in-memory variable), sends `Authorization: Bearer`, and renews it itself: a `/refresh` call plus a 401 interceptor in `fetchMethods` and Apollo. The existing `errorLink` already has an `invalid signature` branch; `jwt expired` goes beside it.

- **No code of ours in the GraphQL auth path.** PostGraphile does the verification; we add nothing in front of it. This is Option A's strongest property.
- **Transport is identical for every caller** — one thing to verify, one thing to document, no per-caller branching.
- **The refresh cookie can be path-scoped** to `/api/public/refresh`, so the durable secret is transmitted on one endpoint instead of on every request.
- **CSRF stays confined to `/refresh`.** A cross-site form cannot set a header, so ordinary API and GraphQL requests are not forgeable.
- **The XSS window is bounded rather than eliminated.** Injected script can read the access token, but *not* the refresh cookie, which stays `HttpOnly` — so a compromise yields a short-TTL token, not the session. That asymmetry is the real argument for A, and it is why A is not merely the lazy option. An in-memory variable narrows it further (a script cannot read it back after the fact) at the price of one round-trip per page load.
- **Cost:** roughly 30–50 lines in the web app, and a portable credential exists in the browser at all.

### The trade, and the lean

Not "silent refresh versus an interceptor" — that framing under-prices B, because once the translation middleware exists, silent renewal on top of it is nearly free. The real question is **whether we are willing to own an auth layer in front of PostGraphile.**

**Leaning B.** The deciding argument is that under B no portable credential exists in the browser at any point, whereas A always has one and merely shortens its life. The cost is bounded and well-understood: a middleware whose translation half is a few lines, in a path we can test directly, sitting in front of a library that has never had any of our code in it. That is a real risk and the reason A stays on the table — but it is a one-time, inspectable cost, against a class of exposure that otherwise never goes away.

**Reviewers: this is the call to comment on.** Everything outside this section holds either way. Note the choice reaches machine clients too — not just the web app: under A they read the token from the response body and send a header; under B they read it from `Set-Cookie` and may send either. What does not change for them is that they hold one durable credential and re-authenticate when it is rejected.

## Open question 2: what durable credential a machine client holds

Settled in §4 and unaffected by this: mSupply is a **dedicated non-admin service account**, authorised by the same RLS policies as anyone else, holding exactly one durable secret and re-authenticating when it is rejected. Only the *kind* of secret is open — and because both options sit on the same service account underneath, switching later is cheap.

### Option A — username and password

The service account is simply a user, and mSupply stores its credentials.

- **No new mechanism.** No provisioning route, no admin UI, nothing to build; it is the login path that already exists.
- **Recovery is an existing flow** — an admin resets the password, the operator updates mSupply's config.
- **The credential is more powerful than the job needs.** A password also grants web UI login, so a leak is full account takeover rather than API access. It is also what password-rotation policies target, and a routine rotation silently breaks the integration.
- **Revocation is coarse** — disable the account or change the password. There is no way to cut one integration while leaving the account usable.
- **Re-authentication forks on org scope.** `/api/public/login` always returns a *no-org* token, so an org-scoped service account must follow it with `/api/login-org` — a conditional second step the integrator has to implement and keep correct.

### Option B — a provisioned, non-rotating session credential  *(leaning)*

An admin mints a long-lived row in the `user_session` table of §2 and shows the token once; mSupply stores that instead of a password. No `api_key` table and no second verification path — this is the earlier API-key idea implemented on machinery §2 already builds.

- **API-only.** It cannot log into the web UI, so a leak is bounded to what the service account can read.
- **Individually revocable.** `revoked_at` cuts one integration without touching the account or any other client — the capability Option A cannot offer at all.
- **Re-authentication is one call regardless of org scope.** The session row already carries `org_id`, so replaying the credential reproduces the right claims whether or not the account is org-scoped. The integrator's client is identical either way and never needs to know which mode it is in — which directly answers the reviewer's requirement that re-auth handle both cases.
- **It must not rotate.** Rotation is right for browsers and wrong here: a crash between receiving a new token and persisting it leaves mSupply with no credential and, having no password, no self-service recovery. A grace window where the previous token stays valid for a few minutes would mitigate it; not rotating at all is simpler.
- **Cost: a provisioning path.** An admin route or UI to mint the credential and display it once, plus a documented re-provisioning procedure — because recovery is out-of-band and will be needed at an inconvenient hour.

### The lean

**Leaning B**, on the same reasoning as Open question 1: spend a bounded, one-time implementation cost to remove a standing class of exposure — here, a partner holding a credential that grants more than the integration needs and cannot be revoked in isolation. Option A remains entirely defensible if we would rather not build provisioning yet; since both are the same service account with a different secret, starting at A and moving to B later costs a config change at the mSupply end and nothing structural at ours.

## Rejected alternatives

> Server-side silent refresh, a cookie-borne access token, and a provisioned session credential for machine clients are **not** rejected — they are the leaning options of the two open questions above.

- **Ship `exp` now and defer the refresh-token split.** Attractive on sequencing — `exp` is a one-liner, the split is a migration across two repos. Rejected because `exp` without a refresh token makes a lapse *unrecoverable*, which forces compensating client machinery (focus-triggered refresh, `exp`-derived scheduling, careful never-let-it-lapse logic) whose entire purpose evaporates the moment §2 lands. Doing both together is less total work than doing them in order.
- **Reuse or share JWTs between Conforma instances.** Superficially appealing once the far end is known to be Conforma. Rejected on two independent grounds: instances have different `JWT_SECRET`s (sharing one lets either forge the other's tokens; avoiding that means moving to a scheme where each server signs with its own private key and publishes a matching public one, and then distributing those keys), and **the payload is not portable** — `pp<policyId>` claims are database primary keys, so server A's `pp3` is a different policy on server B, or none. Conforma→Conforma is therefore just a normal client login, which is what `ConformaLogin` is.

## Consequences

- **Tokens expire everywhere, including GraphQL and including dev.** Anything holding a Conforma JWT longer than the access TTL — scripts, saved Postman requests, long-lived dev sessions — starts failing, correctly. Internal `getAdminJWT()` callers are unaffected by design.
- **Two lifetimes now exist where there was one.** Access TTL (short, may vary by caller) and session lifetime (`logoutAfterInactivity`, extended on renewal). Anything reasoning about `logoutAfterInactivity` as a token property — the web app's `tokenExpiry`, the prefs UI — needs re-pointing at the session.
- **The two-step login survives, but step two changes shape.** `POST /api/login-org` becomes a session update rather than a token trade. The org switcher keeps working; what changes is that it no longer holds or passes a `sessionId`, and the server — not whichever token the client happens to hold — is authoritative about which org a session is in.
- **How machine access gets revoked depends on Open question 2.** Under Option A the only lever is disabling the account or changing the password; under Option B a session row is revoked individually. Either way revocation is not instant: checking a revocation list per request would mean a database lookup each time, defeating a token that verifies on its own — so latency equals the access TTL, a reason not to set it long.
- **`sessionId` can finally mean what the docs claim.** [`src/components/permissions/CLAUDE.md`](../../src/components/permissions/CLAUDE.md) says it "lets the server invalidate a token if the user logs in elsewhere"; nothing does that today. §2 gives it a table to check against — wire it up or correct the doc, but do not leave a security property documented and absent.
- **CSRF scope depends on Open question 1.** Under Option A exactly one route is cookie-authenticated (`/refresh`), protected by `SameSite=Strict`. Under Option B every API and GraphQL request is, and `Lax` stops being sufficient. Either way this is new — nothing is cookie-authenticated today.
- **Local development needs cookie handling.** Different origins in dev means `SameSite=None; Secure` plus CORS credentials — a setup cost and a divergence from production worth documenting rather than discovering.
- **`externalApiConfigs` gains state.** The relay stops being a pure per-request function of config. A credential change may not take effect until the cached token expires — invalidate on prefs reload, [`refreshConfig.ts`](../../src/refreshConfig.ts) is the hook — and acquisition failure is a new failure mode that must not echo a login response body into logs or to the client.
- **Two adjacent bugs fall out of touching `constructAuthHeader`**: `getEnvVariableReplacement` is applied to `Basic.password` but not `Basic.username`, so `username: "env.FOO"` is sent literally; and the `Bearer` branch assigns `axiosRequest.headers = {...}` rather than merging, clobbering any `additionalAxiosProperties.headers`.
- **Suggested order:** §1 + §2 + §3 together (they are one change — `exp` is not safe to ship alone) → §5 → §4 (unblocks mSupply → Conforma) → §6 (unblocks Conforma → mSupply, #342's "little tweaking").
- **Re-openable** if a third-party integrator list appears (revisit a dedicated key table with rate limiting, and OAuth2 client-credentials for inbound), or if Conforma is deployed multi-instance (the in-memory token cache becomes one login per instance — still correct, but a shared cache may be worth it).
