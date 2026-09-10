import { FastifyRequest, FastifyReply } from 'fastify'
import db from '../database/databaseConnect'
import config from '../../config'
import { get as extractProperty } from 'lodash'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { constructQueryObject, validateResult } from './helpers'
import { constructAuthHeader, recordAuthResponse, sessionFor } from './authHeaders'
import { ensureLoggedIn, ExternalLoginError, reloginStatuses } from './login'
import { resolveApiUrl } from './resolveUrl'
import { ApiAuthentication, ExternalApiConfigs, QueryParameters } from './types'
import { getApplicationData } from '../actions'
import { getPermissionNamesFromJWT, getUserInfo } from '../permissions/loginHelpers'
import { ActionApplicationData } from '../../types'
import { errorMessage, getEnvVariableReplacement } from '../utilityFunctions'

export type AccessExternalApiQuery = {
  Querystring: { applicationId?: string }
  Params: { name: string; route: string }
  auth: { userId: number; orgId: number }
}

/*
What the external server is about to receive, for debugging a route that does
not behave: method, the full url with its params serialised exactly as axios
will send them, which cookies are going, and the body if there is one.

Cookie NAMES only, never values -- a session cookie is a credential. Nor the
Authorization header or basic-auth fields, which are not shown at all.
*/
const describeRequest = (axiosRequest: AxiosRequestConfig) => {
  const lines = [
    `Making ${axiosRequest.method?.toUpperCase()} request to: ${axios.getUri(axiosRequest)}`,
  ]

  const cookieHeader = axiosRequest.headers?.Cookie
  if (typeof cookieHeader === 'string' && cookieHeader) {
    const names = cookieHeader.split('; ').map((cookie) => cookie.split('=')[0])
    lines.push(`  cookies: ${names.join(', ')}`)
  }

  if (axiosRequest.data !== undefined) {
    const { data } = axiosRequest
    lines.push(`  body: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }

  return lines.join('\n')
}

/*
Issues the request, and repairs a lapsed session once.

  1. build the auth header -- for CookieLogin, logging in first if the jar is
     empty (constructAuthHeader)
  2. note the session's generation, and send
  3. record any Set-Cookie, on success and error alike
  4. status not in reloginOn              → done, however it went
  5. already replayed                     → return the rejection
  6. generation moved since we sent       → a login completed meanwhile;
                                            re-issue with what it stored
  7. otherwise                            → log in, then re-issue

Each of the last three earns its place. Recording on error responses is how a
cookie the server expires on the rejection itself gets dropped. Replaying at
most once is what stops an API that answers 401 for a reason login cannot fix
(valid credentials, insufficient access) from looping: 401 → login → 401 →
login. And the generation check is what keeps a burst to one login. Twenty
requests go out under generation g; the session expires; the first rejection
back logs in and the store is at g+1 -- but the other nineteen were already in
flight, so their rejections land AFTER that login completed, and each would
otherwise find no login running and start its own. Comparing generations rather
than cookie values matters because a login may hand back the very same session
id, in which case every late rejection would compare equal and log in anyway.

Only CookieLogin has a reloginOn, so for every other auth type this is a single
send with the response cookies recorded.
*/
const sendAuthenticated = async (
  axiosRequest: AxiosRequestConfig,
  authentication: ApiAuthentication,
  apiName: string,
  baseUrl: string
): Promise<AxiosResponse> => {
  const cookieLogin = authentication.type === 'CookieLogin' ? authentication : undefined
  const reloginOn = cookieLogin ? reloginStatuses(cookieLogin) : new Set<number>()

  const attempt = async (replayed: boolean): Promise<AxiosResponse> => {
    await constructAuthHeader(authentication, axiosRequest, apiName, baseUrl)
    const session = cookieLogin && sessionFor(cookieLogin, apiName)
    const generationAtSend = session?.generation

    console.log(describeRequest(axiosRequest))
    try {
      const response = await axios(axiosRequest)
      recordAuthResponse(authentication, response.headers, apiName)
      return response
    } catch (err) {
      if (!(err instanceof AxiosError)) throw err

      // A peer that has ended our session may say so by expiring the cookie, so
      // the error response is worth reading before the status is acted on
      recordAuthResponse(authentication, err.response?.headers, apiName)

      const status = err.response?.status
      if (!cookieLogin || !session || status === undefined || !reloginOn.has(status)) throw err
      if (replayed) {
        console.log(`${apiName} rejected the request again (${status}); not retrying`)
        throw err
      }

      if (generationAtSend === session.generation) {
        console.log(`${apiName} rejected the session (${status}); logging in again`)
        await ensureLoggedIn(session, apiName, cookieLogin, baseUrl)
      } else {
        console.log(`${apiName} rejected the session (${status}); a login has since completed`)
      }
      return attempt(true)
    }
  }

  return attempt(false)
}

export const routeAccessExternalApi = async (
  request: FastifyRequest<AccessExternalApiQuery>,
  reply: FastifyReply
) => {
  const { name, route } = request.params

  const apiConfigs: ExternalApiConfigs = config?.externalApiConfigs ?? {}

  const { baseUrl, routes, authentication } = apiConfigs?.[name]
  if (!baseUrl) {
    throw new Error('No baseUrl defined for API: ' + name)
  }

  const routeConfig = routes?.[route]
  if (!routeConfig) {
    throw new Error('No config definition for Route: ' + route)
  }

  const {
    method,
    url,
    permissions,
    queryParams,
    allowedClientQueryParams,
    returnProperty,
    additionalAxiosProperties,
    validationExpression,
  } = routeConfig

  if (permissions) {
    const { permissionNames } = await getPermissionNamesFromJWT(
      (request as FastifyRequest & { auth: { userId: number; orgId: number } }).auth
    )
    const validPermissions = permissions.filter((permission) =>
      permissionNames.includes(permission)
    )

    if (validPermissions.length === 0) {
      reply.status(403)
      return reply.send('Not authorized to view this resource')
    }
  }

  // Construct data object for subsequent expression evaluator
  const { userId, orgId } =
    (
      request as FastifyRequest<AccessExternalApiQuery> & {
        auth: { userId: number; orgId: number }
      }
    ).auth ?? {}
  const { user } = await getUserInfo({ userId, orgId })
  const evaluatorData: {
    user: typeof user
    applicationData?: ActionApplicationData
  } = { user }

  // ApplicationData only available if an applicationId is provided as a query
  // parameter, and only if user has permission to view that application
  const applicationId = Number(request.query?.applicationId)
  if (applicationId) {
    const { application } = await db.gqlQuery(
      `query getApplication($applicationId: Int!) {
      application(id: $applicationId) { id } }`,
      { applicationId },
      request?.headers?.authorization
    )
    if (application) evaluatorData.applicationData = await getApplicationData({ applicationId })
  }

  // baseUrl takes the same "env.<VAR>" indirection as the credentials do: the
  // server an API points at is the part of the configuration that differs
  // between a test deployment and a live one.
  const resolvedBaseUrl = getEnvVariableReplacement(baseUrl)

  const axiosRequest = {
    method,
    url: resolveApiUrl(resolvedBaseUrl, url),
    ...additionalAxiosProperties,
  } as AxiosRequestConfig

  axiosRequest.params = await constructQueryObject(
    request.query as QueryParameters,
    queryParams,
    allowedClientQueryParams,
    evaluatorData
  )

  if (method === 'post') {
    const { bodyJson, allowedClientBodyFields } = routeConfig
    if (request.body || bodyJson) {
      axiosRequest.data = await constructQueryObject(
        request.body as QueryParameters,
        bodyJson,
        allowedClientBodyFields,
        evaluatorData
      )
    }
  }

  try {
    const response = await sendAuthenticated(axiosRequest, authentication, name, resolvedBaseUrl)

    const result = response.data
    const returnValue = returnProperty ? extractProperty(result, returnProperty, result) : result

    if (
      await validateResult(
        validationExpression,
        returnValue,
        request.query as QueryParameters,
        evaluatorData
      )
    ) {
      console.log('Request successful')
      return reply.send(returnValue)
    } else {
      console.log('Request not authorized, not returning result')
      reply.status(403)
      return reply.send('Not authorized to view result')
    }
  } catch (err) {
    // The far server would not have us, or could not be reached to ask. 502
    // because the failure is upstream, and the message names the API but not
    // the cause: no part of the far server's response reaches our client.
    if (err instanceof ExternalLoginError) {
      reply.status(502)
      return reply.send(err.message)
    }
    if (err instanceof AxiosError) {
      reply.status(err.response?.status ?? 500)
      return reply.send(`External API error: ${err.message}`)
    }
    const errMessage = errorMessage(err)
    console.log('Request error', errMessage)
    reply.status(500)
    return reply.send(`Server error: ${errMessage}`)
  }
}
