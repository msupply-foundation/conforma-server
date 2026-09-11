import { EvaluatorNode } from 'fig-tree-evaluator'

/*
"CookieToken" is for a server that takes its credential in a cookie rather than
a header, and carries whatever that server sets back on subsequent requests, the
way a browser would.

The case it was added for is a peer Conforma server -- the machine-client
mechanism of kdd/auth-token-lifecycle §4 pointed the other way. That server
provisions a long-lived session credential for us (`yarn token session`), which
we send as its "refresh" cookie; because it treats a *missing* access token
exactly as an expired one, it mints one for us and the request proceeds. So
there is no login step and nothing to renew on this side.

The access token it mints comes back as a cookie, and we send that back on
every subsequent request (§7). When it expires the peer mints another from the
same credential and we carry that instead, so the configured `token` is the
only thing this side ever has to hold.

Nothing above is Conforma-specific except the cookie names, which is why they
are configuration: any server whose credential is a cookie fits the same shape.

No `baseUrl` of its own: unlike a login-based scheme there is no second endpoint
to call, so the credential travels with the ordinary request to the API's
`baseUrl`.

"CookieLogin" is for a server that hands out its session only through a login
call, and expires it -- mSupply's v4 API is the case in hand. There is no
long-lived credential anyone can provision for us, so the relay logs in itself
and logs in again when the session lapses (login.ts). One holds a credential
someone provisioned; the other goes and gets one.

It has no `token` and no `cookieName`. A login's cookies arrive as Set-Cookie,
which carries each name alongside its value, so the jar learns them from the
response; CookieToken needs `cookieName` only because its credential is a bare
value pasted into config, with no response header to learn a name from. Keeping
the two types apart is what lets the compiler insist on each one's fields: a
merged type would make both optional, and `{ type: 'CookieToken' }` with no
credential at all would typecheck.

`login.body` is plain strings, optionally `env.`-substituted, and deliberately
not an evaluator expression. The session is held per API and shared by every
caller, so a body carrying per-user or per-application data would mean a
session acquired with one user's details being served to another.

A response whose status is in `reloginOn` is read as "the session has lapsed":
the relay logs in once and re-issues the request once. A login that fails
blocks further logins for `loginFailTimeout` seconds, so a bad credential or a
dead endpoint is not hammered on every request. `loginTimeout` bounds the login
call itself, which needs its own because awaiting it is how every other request
to the API waits its turn (login.ts): one that never answers would hold up all
of them, where one that fails only starts the backoff. None of the three
describes the credential, so editing any of them leaves a live session in
place.
*/
interface CookieLoginAuthentication {
  type: 'CookieLogin'
  login: {
    url: string // resolved against baseUrl
    method?: 'post' | 'get' // default 'post'
    // Strings take env. substitution where prefixed; a value that is not a
    // string -- a JSON author leaving a number unquoted -- is sent as written
    body?: { [key: string]: string | number | boolean }
  }
  // Statuses meaning the session has lapsed. Strings by convention, but a
  // JSON author will naturally leave a status unquoted, so numbers are taken
  reloginOn?: string | number | (string | number)[] // default '401'
  loginTimeout?: number // seconds; default 10
  loginFailTimeout?: number // seconds; default 30
}

type ApiAuthentication =
  | { type: 'Basic'; username: string; password: string }
  | { type: 'Bearer'; token: string }
  | { type: 'CookieToken'; token: string; cookieName: string }
  | CookieLoginAuthentication

type QueryParameters = { [key: string]: EvaluatorNode }

interface RouteCommon {
  url: string
  permissions?: string[]
  queryParams?: QueryParameters
  allowedClientQueryParams?: string[]
  additionalAxiosProperties?: { [key: string]: any }
  returnProperty?: string
  validationExpression?: EvaluatorNode
}

interface GetRoute extends RouteCommon {
  method: 'get'
}

interface PostRoute extends RouteCommon {
  method: 'post'
  bodyJson?: QueryParameters
  allowedClientBodyFields?: string[]
}

type RouteConfig = GetRoute | PostRoute

interface ExternalApiConfigs {
  [key: string]: {
    baseUrl: string
    authentication: ApiAuthentication
    routes: {
      [key: string]: RouteConfig
    }
  }
}

export {
  ApiAuthentication,
  CookieLoginAuthentication,
  QueryParameters,
  RouteConfig,
  PostRoute,
  ExternalApiConfigs,
}
