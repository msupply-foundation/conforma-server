import axios, { AxiosError } from 'axios'
import { CookieLoginAuthentication, ExternalApiConfigs } from './types'
import { ApiSession, recordCookies } from './cookieJar'
import { resolveApiUrl } from './resolveUrl'
import { errorMessage, getEnvVariableReplacement } from '../utilityFunctions'

/*
The login step in front of the cookie jar, for the "CookieLogin" auth type: a
server that hands out its session only through a login call, and expires it.

Three things live here and nothing else: the login call itself, the promise
that de-duplicates it, and the backoff after a failure. Reading `reloginOn`
keeps them company, since what counts as a lapsed session is what decides when
a login is called for.

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
const DEFAULT_LOGIN_TIMEOUT = 10 // seconds
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

/*
A body value that is not a string is sent as written. `env.` indirection is a
string operation, so there is nothing in a number or a boolean to substitute,
and preferences is hand-written JSON where a numeric field will reasonably be
left unquoted -- `loginType` in the mSupply example is the likely one.
Coercing it to a string instead would quietly change what goes over the wire,
to a server that may well care which JSON type it receives.
*/
const substituted = (value: unknown) =>
  typeof value === 'string' ? getEnvVariableReplacement(value) : value

/*
The login call as it will be made: `env.` references replaced, the url still
relative to baseUrl. Throws on a reference whose variable is unset, so a
misconfigured deployment fails loudly here rather than sending the literal
reference as a password.

Called from `sessionFingerprint` as well as from the login itself, so anything
thrown here is thrown for EVERY request to the API, before one is attempted.
That is the right behaviour, and the reason each failure states the config
mistake it found: a bare TypeError from reading a missing url would reach the
client as an opaque 500 with nothing to act on.
*/
export const resolveLogin = ({ login }: CookieLoginAuthentication) => {
  // Typed as a string, but it arrives from preferences JSON
  if (typeof login?.url !== 'string')
    throw new Error('CookieLogin authentication requires a string "login.url"')

  return {
    url: getEnvVariableReplacement(login.url),
    method: login.method ?? 'post',
    body:
      login.body &&
      Object.fromEntries(
        Object.entries(login.body).map(([key, value]) => [key, substituted(value)])
      ),
  }
}

/*
Which response statuses mean the session has lapsed.

`reloginOn` is hand-written JSON, so it arrives as whatever was typed. A value
that is not a status is dropped rather than coerced: `Number` turns
"unauthorized" into NaN and "" into 0, and a set holding either matches no
response at all -- so a lapsed session would simply never be repaired, and
every request would hand the far server's rejection to our client, with
nothing at request time to suggest the configuration was at fault. Dropping it
is the same outcome, but `warnAboutReloginOn` says so once, at startup.

An empty list is left empty. "Never re-login" is a coherent thing to ask for,
and it is the one case where nothing was mistyped.
*/
const isHttpStatus = (value: number) => Number.isInteger(value) && value >= 100 && value <= 599

// `??` rather than a destructuring default, so an explicit null reads as "not
// configured" too rather than coercing to the status 0
const reloginEntries = ({ reloginOn }: CookieLoginAuthentication): unknown[] =>
  ([] as unknown[]).concat(reloginOn ?? DEFAULT_RELOGIN_ON)

export const reloginStatuses = (authentication: CookieLoginAuthentication): Set<number> =>
  new Set(reloginEntries(authentication).map(Number).filter(isHttpStatus))

/*
Reports a `reloginOn` that will not do what its author meant, at startup and
whenever preferences are saved -- not per request, which would be both a hot
path and a log full of the same line.
*/
export const warnAboutReloginOn = (apiConfigs: ExternalApiConfigs = {}) => {
  for (const [name, { authentication }] of Object.entries(apiConfigs)) {
    if (authentication?.type !== 'CookieLogin') continue

    const entries = reloginEntries(authentication)
    const unusable = entries.filter((entry) => !isHttpStatus(Number(entry)))
    if (unusable.length === 0) continue

    const nothingLeft = unusable.length === entries.length
    console.log(
      `!! WARNING: external API "${name}" has a reloginOn value that is not an` +
        ` HTTP status and is ignored: ${unusable.map((entry) => JSON.stringify(entry)).join(', ')}.` +
        (nothingLeft
          ? ' Nothing usable is left, so a lapsed session will never be repaired -- every' +
            " request will hand the far server's rejection back to the client."
          : '')
    )
  }
}

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
    const response = await axios({
      method,
      url: loginUrl,
      data: body,

      // Awaiting this promise is how every other request to the API waits its
      // turn, so a login that is accepted and never answered holds up all of
      // them, indefinitely -- nothing else bounds it, as Fastify sets no
      // request timeout and the backoff only starts once a login has FAILED.
      // Failing is the better outcome by far: the backoff starts and requests
      // get a 502 instead of hanging until the process runs out of sockets.
      timeout: (authentication.loginTimeout ?? DEFAULT_LOGIN_TIMEOUT) * 1000,

      // A login's Set-Cookie commonly rides on a 302 to a landing page, and a
      // followed redirect leaves only the LAST response's headers -- so the
      // cookie would vanish and a login that worked would read as one that
      // set nothing: failure, backoff, and the same again forever. Stopping
      // at the redirect keeps it. validateStatus is what then admits a 3xx as
      // a response at all, axios counting only 2xx as one by default; whether
      // it actually carried a session is still the `stored` check below.
      maxRedirects: 0,
      validateStatus: (status) => status < 400,
    })

    // A 2xx that sets nothing is a failure, not a success: there is nothing
    // to hold, and calling it success would mean logging in on every request.
    //
    // Harvested into a copy, because that verdict comes after the harvest and
    // harvesting is destructive -- a response that EXPIRES a cookie deletes
    // it, and counts nothing stored. A server clearing a partial session on a
    // bad password answers exactly so, and against the live jar that would
    // delete the working session this failure is then documented as keeping,
    // with the backoff blocking the login that would replace it.
    const harvested = new Map(session.cookies)
    const stored = recordCookies(harvested, response.headers?.['set-cookie'])
    if (stored === 0) {
      // Naming the redirect is what points an operator at the fix, which is
      // to configure `login.url` as the address the redirect leads to
      const redirect = response.status >= 300 ? ', and redirects are not followed' : ''
      throw new Error(`the ${response.status} response set no cookie${redirect}`)
    }

    session.cookies = harvested
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
