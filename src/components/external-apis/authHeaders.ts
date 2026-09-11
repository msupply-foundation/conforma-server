import { AxiosRequestConfig } from 'axios'
import { createHash } from 'crypto'
import { ApiAuthentication } from './types'
import { getEnvVariableReplacement } from '../utilityFunctions'
import { ApiSession, getSession, recordCookies, storedCookies } from './cookieJar'
import { ensureLoggedIn, resolveLogin } from './login'

type CookieAuthentication = Extract<ApiAuthentication, { type: 'CookieToken' | 'CookieLogin' }>

const sha256 = (input: string) => createHash('sha256').update(input).digest('hex')

/*
Identifies the credential a session was filled under, so that editing it in
preferences orphans the session (cookieJar.ts). A hash rather than the
credential itself: the same stability and the same comparison, but no secret is
ever a value in a process-lifetime map, recoverable from a heap dump or
printable by a debug log. It must never be logged either -- a hash of a
password is still something to attack.

For CookieToken the credential is the resolved token. For CookieLogin it is the
resolved login call -- url, method and body -- since that is what the session
was acquired with. `reloginOn`, `loginTimeout` and `loginFailTimeout` take no
part: they say how to read a response, how long to wait for one and how long to
back off, not which credential we hold, so editing them must not throw away a
live session.
*/
const sessionFingerprint = (authentication: CookieAuthentication) => {
  switch (authentication.type) {
    case 'CookieToken':
      return sha256(getEnvVariableReplacement(authentication.token))
    case 'CookieLogin': {
      const { url, method, body } = resolveLogin(authentication)
      return sha256(JSON.stringify([url, method, Object.entries(body ?? {}).sort()]))
    }
  }
}

// The store entry a cookie-based auth type reads and writes. The other types
// have nothing a server could set on them.
const sessionFor = (authentication: ApiAuthentication, apiName: string): ApiSession | undefined =>
  authentication.type === 'CookieToken' || authentication.type === 'CookieLogin'
    ? getSession(apiName, sessionFingerprint(authentication))
    : undefined

// Merges rather than assigns, so auth doesn't wipe out any headers the route
// supplied through "additionalAxiosProperties"
const setHeader = (axiosRequest: AxiosRequestConfig, name: string, value: string) => {
  axiosRequest.headers = { ...axiosRequest.headers, [name]: value }
}

// Adds appropriate auth properties to Axios request object (modifies in-place).
// Async for CookieLogin alone, which may have to log in before it has anything
// to present; the other branches never await.
const constructAuthHeader = async (
  authentication: ApiAuthentication,
  axiosRequest: AxiosRequestConfig,
  apiName: string,
  baseUrl: string
) => {
  switch (authentication.type) {
    case 'Basic': {
      const { username, password } = authentication
      axiosRequest.auth = {
        username: getEnvVariableReplacement(username),
        password: getEnvVariableReplacement(password),
      }
      break
    }

    case 'Bearer': {
      const token = getEnvVariableReplacement(authentication.token)
      setHeader(axiosRequest, 'Authorization', `Bearer ${token}`)
      break
    }

    // A server that takes its credential in a cookie, behaving as a browser
    // does: present the credential, and whatever the server has set on us since
    // (see types.ts).
    //
    // For a peer Conforma the stored cookie is the access token it minted from
    // our credential, and sending both is what lets the server choose: it
    // prefers the access token and falls back to the credential only when that
    // one is missing or expired. The fallback happens within the request, so
    // there is nothing to retry and no expiry for us to track.
    case 'CookieToken': {
      const token = getEnvVariableReplacement(authentication.token)
      const { cookieName } = authentication
      const session = getSession(apiName, sessionFingerprint(authentication))

      // Encoded because a cookie value is read back decoded -- Conforma's own
      // reader does, and RFC 6265 has no other escaping for ";" or ","
      const cookies = [
        `${cookieName}=${encodeURIComponent(token)}`,
        ...storedCookies(session.cookies),
      ]

      setHeader(axiosRequest, 'Cookie', cookies.join('; '))
      break
    }

    // A server that hands out its session only through a login call. The
    // login's Set-Cookie is harvested into the same jar, so from here on it is
    // the CookieToken case without a credential of our own to present.
    //
    // An empty jar logs in first, rather than relaying without a cookie and
    // letting the rejection drive the login. That would make correctness depend
    // on how the far server answers a MISSING cookie, which is a different
    // question from how it answers an expired one, and APIs commonly differ
    // (401 expired, 400 or 403 absent). It would also turn a cold burst into
    // twenty rejections before the one login.
    case 'CookieLogin': {
      const session = getSession(apiName, sessionFingerprint(authentication))
      if (session.cookies.size === 0) {
        await ensureLoggedIn(session, apiName, authentication, baseUrl)
      }

      setHeader(axiosRequest, 'Cookie', storedCookies(session.cookies).join('; '))
      break
    }

    default:
      throw new Error('Invalid authorisation config')
  }
}

/*
Picks up cookies the server set on this request, so the next one can present
them. Called for every response, including error responses: a server that has
ended our session says so by expiring the cookie, and that is exactly when we
most want to stop sending it. For CookieLogin it is also how a session cookie
the server rotates is picked up.

A no-op for the other auth types, whose credentials no server replaces.
*/
const recordAuthResponse = (
  authentication: ApiAuthentication,
  responseHeaders: { 'set-cookie'?: string[] } | undefined,
  apiName: string
) => {
  const session = sessionFor(authentication, apiName)
  if (!session) return

  recordCookies(
    session.cookies,
    responseHeaders?.['set-cookie'],
    authentication.type === 'CookieToken' ? authentication.cookieName : undefined
  )
}

export { constructAuthHeader, recordAuthResponse, sessionFingerprint, sessionFor }
