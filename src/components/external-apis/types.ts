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
*/
type ApiAuthentication =
  | { type: 'Basic'; username: string; password: string }
  | { type: 'Bearer'; token: string }
  | { type: 'CookieToken'; token: string; cookieName: string }

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

export { ApiAuthentication, QueryParameters, RouteConfig, PostRoute, ExternalApiConfigs }
