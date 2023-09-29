import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'

type ApiAuthentication =
  | { type: 'Basic'; username: string; password: string }
  | { type: 'Bearer'; token: string }

type QueryParameters = { [key: string]: EvaluatorNode }

interface RouteCommon {
  url: string
  queryParams?: QueryParameters
  permissions?: string[]
  allowedQueries?: string[]
  additionalAxiosProperties?: { [key: string]: any }
  returnProperty?: string
}

interface GetRoute extends RouteCommon {
  method: 'get'
}

interface PostRoute extends RouteCommon {
  method: 'post'
  bodyJson?: QueryParameters
  allowedBodyFields?: string[]
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
