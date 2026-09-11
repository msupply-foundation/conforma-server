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
not behave: method, the url, and which query parameters, cookies and body
fields are going with it.

NAMES only, never values, for all three. A session cookie is a credential. A
query parameter or a body field carries the client's own data -- in this domain
a patient identifier or an application's contents -- and may equally carry a
secret, since a route's configured `queryParams` and `bodyJson` take literals
and are not env-substituted. Which fields a route is sending is what diagnoses
a route that misbehaves; what is in them is not the log's business. The
Authorization header and basic-auth fields are not shown at all.
*/

// The names in an outgoing field map, or undefined when there is nothing to
// show. A body that is not a field map -- a route may set a raw one through
// `additionalAxiosProperties` -- has no names, and its content is no more
// ours to print than any other, so its presence is noted and no more.
const describeFields = (value: unknown) => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'object') return '(not shown)'

  const names = Object.keys(value)
  return names.length > 0 ? names.join(', ') : undefined
}

const describeRequest = (axiosRequest: AxiosRequestConfig) => {
  const lines = [`Making ${axiosRequest.method?.toUpperCase()} request to: ${axiosRequest.url}`]

  const params = describeFields(axiosRequest.params)
  if (params) lines.push(`  params: ${params}`)

  const cookieHeader = axiosRequest.headers?.Cookie
  if (typeof cookieHeader === 'string' && cookieHeader) {
    const names = cookieHeader.split('; ').map((cookie) => cookie.split('=')[0])
    lines.push(`  cookies: ${names.join(', ')}`)
  }

  const body = describeFields(axiosRequest.data)
  if (body) lines.push(`  body fields: ${body}`)

  return lines.join('\n')
}

/*
Issues the request, and repairs a lapsed session once.

  1. build the auth header -- for CookieLogin, logging in first if the jar is
     empty (constructAuthHeader)
  2. note the session's generation, and send
  3. generation unmoved                   → record any Set-Cookie, on success
                                            and error alike
  4. status not in reloginOn              → done, however it went
  5. already replayed                     → return the rejection
  6. generation moved since we sent       → a login completed meanwhile;
                                            re-issue with what it stored
  7. otherwise                            → log in, then re-issue

Each of the last four earns its place. Recording on error responses is how a
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

The same comparison gates the recording, which is why it comes first. A late
response describes the session that has already been replaced, so harvesting
its cookies would write the dead session's state over the live one -- against a
server that expires the cookie to end a session, deleting the cookie the new
login stored, and undoing the de-duplication the generation exists to provide.

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

    // Whether the response is talking about the session we still hold. A login
    // that completed while this request was in flight has replaced it, and the
    // response's cookies belong to the session it replaced: a server that ends
    // a session by expiring its cookie would have us delete the very cookie
    // that login just stored.
    const describesCurrentSession = () => !session || generationAtSend === session.generation

    console.log(describeRequest(axiosRequest))
    try {
      const response = await axios(axiosRequest)
      if (describesCurrentSession()) recordAuthResponse(authentication, response.headers, apiName)
      return response
    } catch (err) {
      if (!(err instanceof AxiosError)) throw err

      // A peer that has ended our session may say so by expiring the cookie, so
      // the error response is worth reading before the status is acted on
      if (describesCurrentSession())
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

  /*
  An unrecognised name or route is the client asking for something that does
  not exist, so 404 -- and it must be answered before the config is read, or
  destructuring an absent API throws where nothing catches it: these run ahead
  of the try block below, so what reaches the client is Fastify's own 500
  carrying an internal message about destructuring.

  The message names only what the caller already sent, with which of the two
  was wrong left to the log. Both are 404 for the same reason, so answering
  them alike tells a caller nothing about what else is configured.
  */
  const notFound = () => {
    reply.status(404)
    return reply.send(`Unknown external API route: ${name}/${route}`)
  }

  const apiConfig = apiConfigs[name]
  if (!apiConfig) {
    console.log(`No external API is configured under the name: ${name}`)
    return notFound()
  }

  const { baseUrl, routes, authentication } = apiConfig

  const routeConfig = routes?.[route]
  if (!routeConfig) {
    console.log(`External API ${name} has no route configured as: ${route}`)
    return notFound()
  }

  // A configured API with no baseUrl is a mistake on this side, not the
  // caller's, and there is nothing they could ask differently
  if (!baseUrl) {
    throw new Error('No baseUrl defined for API: ' + name)
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
