import axios, { AxiosError } from 'axios'
import { CookieLoginAuthentication } from './types'
import { ApiSession, recordCookies } from './cookieJar'
import { resolveApiUrl } from './resolveUrl'
import { errorMessage, getEnvVariableReplacement } from '../utilityFunctions'

/*
The login step in front of the cookie jar, for the "CookieLogin" auth type: a
server that hands out its session only through a login call, and expires it.

Three things live here and nothing else: the login call itself, the promise
that de-duplicates it, and the backoff after a failure.

The login promise is the queue. Its presence on the session is the "logging
in" flag, and awaiting it is how a request waits its turn -- so twenty requests
that find the session dead together produce one login, and every one of them
resumes when it completes. There is no separate flag to drift out of step with
it, and no list of parked requests to drain: a drain that throws partway leaves
the rest unanswered until they time out, and `await` has no such failure mode.

A failed login sets the backoff and touches nothing else. Logins fail for
reasons that may say nothing about the cookies we hold -- the endpoint is
unreachable, returns 5xx, is rate-limiting us -- and the login may have been
provoked by a permission-shaped rejection against a session that is perfectly
live. Clearing the cookies would take every route on the API down for the
backoff window on evidence about one route and one blip. So the backoff blocks
LOGINS only; relaying continues with whatever is stored. If the stored session
really is dead, that costs one wasted upstream call per request for the window;
if it is live, everything else keeps working. Rejected (a response came back)
and unreachable (none did) are logged apart so an operator can tell a bad
credential from a bad network, but they are handled alike -- the line between
them is fuzzy for a 429 or a 503, and keeping the cookies makes it moot.

Nothing secret is ever logged: not the login body, not the response body, not a
cookie value, not the fingerprint. The attempt and its outcome status only.
*/

const DEFAULT_RELOGIN_ON = '401'
const DEFAULT_LOGIN_FAIL_TIMEOUT = 30 // seconds

// What our own client is told. The failure is upstream, so 502 -- not 401,
// which would say its Conforma session is bad, which is untrue and would trip
// the web app's own auth handling. The message names the API and not the cause.
export class ExternalLoginError extends Error {
  constructor(apiName: string) {
    super(`Unable to log in to external API: ${apiName}`)
    this.name = 'ExternalLoginError'
  }
}

// The login call as it will be made: `env.` references replaced, the url
// still relative to baseUrl. Throws on a reference whose variable is unset,
// so a misconfigured deployment fails loudly here rather than sending the
// literal reference as a password.
export const resolveLogin = ({ login }: CookieLoginAuthentication) => ({
  url: getEnvVariableReplacement(login.url),
  method: login.method ?? 'post',
  body:
    login.body &&
    Object.fromEntries(
      Object.entries(login.body).map(([key, value]) => [key, getEnvVariableReplacement(value)])
    ),
})

// Which response statuses mean the session has lapsed, as a set of numbers
export const reloginStatuses = ({
  reloginOn = DEFAULT_RELOGIN_ON,
}: CookieLoginAuthentication): Set<number> =>
  new Set(([] as (string | number)[]).concat(reloginOn).map(Number))

const describeFailure = (err: unknown) => {
  if (err instanceof AxiosError) {
    return err.response
      ? `rejected with ${err.response.status}`
      : `unreachable (${err.code ?? err.message})`
  }
  return errorMessage(err)
}

const login = async (
  session: ApiSession,
  apiName: string,
  authentication: CookieLoginAuthentication,
  baseUrl: string
) => {
  // Outside the try: a configuration mistake is not a login attempt, so it is
  // reported as itself and does not start the backoff
  const { url, method, body } = resolveLogin(authentication)
  const loginUrl = resolveApiUrl(baseUrl, url)

  console.log(`Logging in to ${apiName}: ${method.toUpperCase()} ${loginUrl}`)
  try {
    const response = await axios({ method, url: loginUrl, data: body })

    // A 2xx that sets nothing is a failure, not a success: there is nothing
    // to hold, and calling it success would mean logging in on every request
    const stored = recordCookies(session, response.headers?.['set-cookie'])
    if (stored === 0) throw new Error(`the ${response.status} response set no cookie`)

    session.generation += 1
    session.failedUntil = undefined
    console.log(`Login to ${apiName} succeeded (${response.status})`)
  } catch (err) {
    const timeout = authentication.loginFailTimeout ?? DEFAULT_LOGIN_FAIL_TIMEOUT
    session.failedUntil = Date.now() + timeout * 1000
    console.log(
      `Login to ${apiName} failed: ${describeFailure(err)}. No further attempts for ${timeout}s`
    )
    throw new ExternalLoginError(apiName)
  }
}

/*
Makes sure a login has completed, starting one only if none is in flight, and
throwing rather than starting one inside the backoff window.

The promise is cleared by a reaction chained onto it rather than by a finally
block inside `login`, so it cannot be cleared before it has been assigned. A
login that fails before its first await would otherwise clear it first, and the
assignment would then leave a settled promise on the session for ever.

That ordering also keeps a request arriving between the failure and the
clearing from starting a second login: `failedUntil` is set before the promise
settles, and it is checked first.
*/
export const ensureLoggedIn = async (
  session: ApiSession,
  apiName: string,
  authentication: CookieLoginAuthentication,
  baseUrl: string
) => {
  if (session.failedUntil !== undefined && session.failedUntil > Date.now()) {
    console.log(
      `Not logging in to ${apiName}: a recent login failed and the backoff has not elapsed`
    )
    throw new ExternalLoginError(apiName)
  }

  if (!session.loginPromise) {
    session.loginPromise = login(session, apiName, authentication, baseUrl).finally(() => {
      session.loginPromise = undefined
    })
  }

  await session.loginPromise
}
