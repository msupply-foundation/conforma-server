import { FastifyReply, FastifyRequest } from 'fastify'
import config from '../../config'

/*
Transport for both auth tokens -- see kdd/auth-token-lifecycle §3

Tokens are delivered only as HttpOnly cookies, never in a response body: without
that rule, injected script could call an endpoint, have the browser attach the
cookie automatically, and read a usable token straight out of the response -- at
which point HttpOnly protects nothing.

Two cookies, and not for leak isolation (both live in the same jar under the
same flags). The split is structural: the access token must be a JWT, because
every RLS policy reads its claims; the refresh token cannot be, because its job
is to be looked up in a table and deleted.

SameSite=Strict (not Lax) because every API and GraphQL request is now
cookie-authenticated, and PostGraphile answers GET queries, which Lax would
leave forgeable cross-site.
*/

export const ACCESS_COOKIE_NAME = 'access'
export const REFRESH_COOKIE_NAME = 'refresh'

// Neither cookie's own lifetime is the authority on anything. The access token
// carries its own "exp", and the session row carries the refresh token's -- so
// both cookies are given the longest life browsers will honour (Chrome caps
// persistent cookies at 400 days) and the server decides when they stop
// working.
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60 // Seconds

/*
"Secure" is not "the scheme must be https" -- browsers test it against the
Secure Contexts notion of a *potentially trustworthy origin*, which grants
loopback (`localhost`, `127.0.0.0/8`, `::1`) the same standing as TLS. Loopback
traffic cannot reach a network interface, so there is no path for an attacker
to sit on, which is why ordinary local development over http keeps its cookies.

A LAN address earns no such exemption: private ranges were deliberately left
out, because nothing in `192.168.x.x` distinguishes a home network from hostile
cafe wifi. So testing the app from a phone at `http://192.168.x.x` has the
browser discard both cookies at login -- silently, since the response is a
normal 200 -- and every later request arrives unauthenticated.

Dropping the flag is the only way to make that case work without serving the
dev site over TLS. config.allowInsecureCookies is false unless
INSECURE_COOKIES_FOR_LAN_TESTING is set, and is forced false in a production
build and on a live server alike (see config.ts), so a deployment gets the full
flag set however it was launched.
*/
const COOKIE_FLAGS = config.allowInsecureCookies
  ? ['Path=/', 'HttpOnly', 'SameSite=Strict']
  : ['Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict']

/*
Fastify APPENDS repeated Set-Cookie headers rather than replacing them, which is
what lets both cookies go out on one reply -- but it also means a cookie set
twice in one request is sent twice. That happens routinely: the middleware mints
an access token so the route can authenticate, and the route then issues a
fresher one of its own. So any earlier value for this cookie name is dropped
first, leaving exactly one Set-Cookie per name, last write winning.
*/
const setCookie = (reply: FastifyReply, name: string, value: string, maxAge: number) => {
  const existing = reply.getHeader('set-cookie')

  if (existing) {
    const otherCookies = (Array.isArray(existing) ? existing : [existing])
      .map(String)
      .filter((cookie) => !cookie.startsWith(`${name}=`))

    reply.removeHeader('set-cookie')
    otherCookies.forEach((cookie) => reply.header('Set-Cookie', cookie))
  }

  reply.header(
    'Set-Cookie',
    [`${name}=${encodeURIComponent(value)}`, `Max-Age=${maxAge}`, ...COOKIE_FLAGS].join('; ')
  )
}

const getCookie = (request: FastifyRequest, name: string): string | null => {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return null

  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=')
    if (separator === -1) continue
    if (cookie.slice(0, separator).trim() !== name) continue
    return decodeURIComponent(cookie.slice(separator + 1).trim())
  }

  return null
}

export const setAccessCookie = (reply: FastifyReply, token: string) =>
  setCookie(reply, ACCESS_COOKIE_NAME, token, COOKIE_MAX_AGE)

export const setRefreshCookie = (reply: FastifyReply, token: string) =>
  setCookie(reply, REFRESH_COOKIE_NAME, token, COOKIE_MAX_AGE)

export const getAccessToken = (request: FastifyRequest) => getCookie(request, ACCESS_COOKIE_NAME)

export const getRefreshToken = (request: FastifyRequest) => getCookie(request, REFRESH_COOKIE_NAME)

/*
Expiring a cookie is setting it with Max-Age=0, which tells the browser to
discard it immediately. The flags must match those it was set with, or it is
treated as a different cookie and the original is left in place.

Expiring the access cookie on its own discards a token without ending the
session behind it: the next request finds no usable access token, takes the
ordinary renewal path, and is issued one built from the session row. That is how
a snapshot restore hands the admin claims describing the restored database
rather than the one it replaced.
*/
export const clearAccessCookie = (reply: FastifyReply) =>
  setCookie(reply, ACCESS_COOKIE_NAME, '', 0)

/*
Logout has to expire both cookies as well as deleting the session, or the
browser keeps presenting a cookie whose row is gone.
*/
export const clearAuthCookies = (reply: FastifyReply) => {
  clearAccessCookie(reply)
  setCookie(reply, REFRESH_COOKIE_NAME, '', 0)
}
