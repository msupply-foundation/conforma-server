# External API access — proposed improvements

Two enhancements to the existing external-API relay (see [External-API-Access.md](documentation/External-API-Access.md) and [src/components/external-apis/](src/components/external-apis/)):

1. Support for APIs that require a login step to obtain a token, with automatic refresh.
2. A retry mechanism for back-end write actions, so transient failures don't lose the request.

Both are additive — existing `Basic` and `Bearer` auth and the existing inline request path keep working unchanged.

---

## 1. Token-based authentication with refresh

### Current state

`constructAuthHeader` in [helpers.ts](src/components/external-apis/helpers.ts) is stateless: every request reads credentials from `preferences.json` (with `env.*` substitution) and attaches them to the axios request. There's no token cache, no login step, no refresh.

### New auth types

Two new variants added to `ApiAuthentication` in [types.ts](src/components/external-apis/types.ts):

```ts
| { type: 'OAuth2ClientCredentials';
    tokenUrl: string;
    clientId: string;
    clientSecret: string;        // env.* substitution supported
    scope?: string;
    audience?: string;
    extraBody?: Record<string, string>;
  }
| { type: 'CustomLogin';
    loginRequest: AxiosRequestConfig;   // method/url/body/headers; supports env.* and FigTree
    tokenPath: string;                  // e.g. "data.access_token"
    expiresInPath?: string;             // seconds; if absent, falls back to staticTtlSeconds
    staticTtlSeconds?: number;          // fallback for APIs that don't return TTL
    refreshTokenPath?: string;          // optional; enables refresh-grant flow
  }
```

`OAuth2ClientCredentials` covers standard machine-to-machine OAuth. `CustomLogin` is an escape hatch for non-standard auth servers (a `/login` endpoint returning a token + expiry in some custom JSON shape).

### TokenManager

A new module (e.g. `src/components/external-apis/tokenManager.ts`) holds an in-memory cache keyed by API name:

```ts
Map<apiName, {
  token: string;
  expiresAt: number;          // epoch ms
  inFlight?: Promise<string>; // shared promise during fetch
}>
```

- In-memory only. Restarts re-fetch; we don't persist tokens.
- `inFlight` prevents thundering-herd: concurrent callers awaiting the same fetch share one promise.

The TokenManager exposes `getAuthHeader(apiName, authConfig)` and `invalidate(apiName)`.

### Request flow — step by step

For every external API call (proactive primary, reactive fallback):

1. The route handler in [routes.ts](src/components/external-apis/routes.ts) asks `TokenManager.getAuthHeader(apiName, authConfig)` instead of calling `constructAuthHeader` directly.
2. TokenManager checks its cache for `apiName`:
   - **No entry, or `expiresAt - now < 60s`** → perform a login/refresh request now. If an `inFlight` promise already exists, await it instead of starting a second fetch.
   - **Otherwise** → return the cached header immediately, no extra round trip.
3. The login/refresh request hits the configured `tokenUrl` (OAuth) or `loginRequest` (CustomLogin), extracts the token (and `expires_in` if present), and stores `{ token, expiresAt }` in the cache.
4. The outbound request is made to the external API with the resulting `Authorization: Bearer <token>` header.
5. **If the response is 401**:
   - Call `TokenManager.invalidate(apiName)` to drop the cached entry.
   - Call `TokenManager.getAuthHeader(...)` again (forces a fresh login).
   - Retry the original outbound request **once**.
   - If it 401s again, give up and surface the error.
6. Any other error (network, 5xx, 4xx-other-than-401) is returned as today — no retry from the auth layer. (Retries for write actions are handled separately, see §2.)

The 401 path is a safety net for clock skew, early server-side revocation, or APIs that don't reliably return `expires_in`. In steady state, the proactive 60-second buffer means token fetches happen *before* the existing token would have expired, so most requests pay no extra round trip.

### Why not a scheduled refresh job?

Token lifetimes vary widely between providers (5 minutes to 30 days). A fixed cron would either wake idle APIs unnecessarily or miss short-lived tokens. Demand-driven refresh keyed off the token's actual `expires_at` is simpler and correct for all cases.

---

## 2. Retry queue for back-end write actions

### Scope

This applies to **back-end action calls** to external APIs, not to the existing front-end relay endpoint. Front-end calls remain read-only and continue to surface errors immediately as today.

The mechanism follows the same pattern as the existing `trigger_queue` / `action_queue`: a persistent table swept by a scheduled job.

### Schema sketch

New table `external_api_queue`:

| column                | type                                      | notes                                                          |
| --------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `id`                  | serial PK                                 |                                                                |
| `api_name`            | text                                      |                                                                |
| `route`               | text                                      |                                                                |
| `request_payload`     | jsonb                                     | method, url, params, body, headers                             |
| `idempotency_key`     | uuid                                      | generated once, reused on every attempt                        |
| `status`              | enum `pending` \| `success` \| `failed`   |                                                                |
| `attempts`            | int                                       |                                                                |
| `max_attempts`        | int                                       | copied from route config                                       |
| `next_attempt_at`     | timestamptz                               |                                                                |
| `last_error`          | text                                      |                                                                |
| `response`            | jsonb                                     | populated on success                                           |
| `application_id`      | int (nullable)                            | for error context / notifications                              |
| `user_id`             | int (nullable)                            | who triggered the action                                       |
| `action_queue_id`     | int (nullable)                            | links back to originating action for traceability              |
| `created_at`          | timestamptz                               |                                                                |
| `completed_at`        | timestamptz                               |                                                                |

### Route config additions

Per-route, opt-in retry block in `RouteConfig`:

```ts
retry?: {
  maxAttempts: number;          // e.g. 8
  backoff: 'exponential' | 'fixed';
  initialDelayMs: number;
  maxDelayMs: number;
  retryOn?: number[];           // default: network errors + all 5xx; never 4xx
  idempotent: true;             // required to enable retry — a conscious declaration
  idempotencyKeyHeader?: string; // e.g. "Idempotency-Key" if the remote API honours it
}
```

`idempotent: true` is mandatory to enable retry. Retrying a non-idempotent POST is a footgun (duplicate side effects on the remote side); making the caller declare it explicitly forces the question to be answered per route.

### Scheduler integration

A new schedule type `externalApiRetry` is added to [scheduler.ts](src/components/scheduler.ts), with a default cadence (e.g. every minute) overridable in `preferences.json`. On each tick it runs a sweep function that processes due queue rows.

### Retry flow — step by step

When a back-end action invokes an external API write:

1. **Inline first attempt.** The action calls the external API normally (via the same code path as today, plus TokenManager from §1). If it succeeds, return the response — nothing is queued, behaviour is unchanged.
2. **On failure**, classify the error:
   - **4xx (other than 408/429)** → don't queue, return error. Validation/auth errors won't get better with retry.
   - **Network error, 5xx, 408, 429, or any code in `retryOn`** → proceed to step 3.
3. **Enqueue.** If the route's `retry` config is present and `idempotent: true`:
   - Insert a row into `external_api_queue` with `status='pending'`, `attempts=1`, a freshly-generated `idempotency_key`, and `next_attempt_at = now() + initialDelayMs`.
   - The action proceeds (the action itself may mark its own success / completion separately — the external push is now decoupled).
   - If the route has no `retry` config, return the error to the action as today.
4. **Scheduled sweep** (every minute or as configured):
   - Select rows where `status='pending' AND next_attempt_at <= now()`, ordered by `next_attempt_at`. Take a small batch (e.g. 20) to avoid long-running ticks.
   - For each row:
     a. Mark in-progress (e.g. update `next_attempt_at` to a far-future sentinel, or use `SELECT ... FOR UPDATE SKIP LOCKED` to coordinate if multiple workers ever exist).
     b. Reconstruct the request from `request_payload`. If the route uses an idempotency-key header, attach it from `idempotency_key`.
     c. Get auth header from TokenManager (§1).
     d. Execute the request.
5. **On success**: set `status='success'`, `response=<body>`, `completed_at=now()`. Done.
6. **On retryable failure**:
   - Increment `attempts`.
   - If `attempts >= max_attempts` → set `status='failed'`, `last_error=<message>`, `completed_at=now()`, and trigger a notification (via the existing `notification` table, an admin alert, or a log line — to be decided per deployment).
   - Otherwise → compute the next backoff delay (`initialDelayMs * 2^(attempts-1)` capped at `maxDelayMs` for exponential; constant for fixed), set `next_attempt_at = now() + delay`, store `last_error`, leave `status='pending'`.
7. **On non-retryable failure during sweep** (e.g. a 400 that wasn't possible on the first attempt because the payload was generated fresh): set `status='failed'` immediately and notify, same as step 6's terminal branch.

### Idempotency

Three layers, in order of preference:

1. **Remote API supports idempotency keys** → set `idempotencyKeyHeader` in route config; the queue's `idempotency_key` is sent unchanged on every attempt, and the remote deduplicates.
2. **Remote API is naturally idempotent** (e.g. PUT to a known resource ID, upsert semantics) → `idempotent: true` alone is enough.
3. **Neither** → retry must not be enabled for this route. The action should handle failure itself.

### Why persistent, not in-memory?

- Survives server restarts. An in-memory retry loop loses everything on restart, which can happen mid-backoff.
- Audit trail. The queue table is itself a record of what was sent, when, with what payload, and what came back.
- Reuses an existing architectural pattern in the codebase (the trigger/action queues), keeping operational ergonomics consistent.

---

## Decisions still to make

- **Notification channel for terminal failures.** Reuse `notification` table? Admin-only? Email? Tied to the originating application / action?
- **OAuth grants beyond `client_credentials`.** Add `password` or `refresh_token` grants only when a real use case appears; YAGNI for now.
- **Backoff parameters.** Reasonable defaults at the route-config level (e.g. `maxAttempts: 8`, `initialDelayMs: 30_000`, `maxDelayMs: 3_600_000`, `backoff: 'exponential'`) give a window of ~hours rather than seconds — sensible for "keep trying for a while" without unbounded retries.
- **Sweep concurrency.** With a single server process, simple `FOR UPDATE SKIP LOCKED` is overkill but cheap insurance for any future multi-worker setup.
