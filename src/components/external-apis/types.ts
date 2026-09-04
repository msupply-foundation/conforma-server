import { EvaluatorNode } from 'fig-tree-evaluator'

/*
"ConformaSession" is for calling a peer Conforma server, and is the machine-client
mechanism of kdd/auth-token-lifecycle §4 pointed the other way: that server
provisions a long-lived session credential for us (`yarn token session`), and we
present it as the refresh cookie on every request. Because it treats a *missing*
access token exactly as an expired one, it mints an access token for us and the
request proceeds -- so there is no login step, no token to cache and nothing to
renew on this side.

No `baseUrl` of its own: unlike a login-based scheme there is no second endpoint
to call, so the credential travels with the ordinary request to the API's
`baseUrl`.
*/
type ApiAuthentication =
  | { type: 'Basic'; username: string; password: string }
  | { type: 'Bearer'; token: string }
  | { type: 'ConformaSession'; token: string }

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
