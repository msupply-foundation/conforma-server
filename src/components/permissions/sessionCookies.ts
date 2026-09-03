import { FastifyReply, FastifyRequest } from 'fastify'

/*
Transport for the refresh token -- see kdd/auth-token-lifecycle/draft-kdd.md §3

The refresh token is delivered only as an HttpOnly cookie, never in a response
body: without that rule, injected script could call an endpoint, have the
browser attach the cookie automatically, and read a usable token straight out of
the response -- at which point HttpOnly protects nothing.

SameSite=Strict (not Lax) because every API and GraphQL request becomes
cookie-authenticated, and PostGraphile answers GET queries, which Lax would
leave forgeable cross-site.

NOTE: this is only the half needed to create and identify a session at login.
Reading the access token, silently renewing it, and the CORS "credentials"
handling that cross-origin dev needs are all still to come (§3).
*/

export const REFRESH_COOKIE_NAME = 'refresh'

// The session row, not the cookie, is what expires: "expires_at" is extended
// every time an access token is minted, and the token itself is never reissued.
// So the cookie is given the longest life browsers will honour (Chrome caps
// persistent cookies at 400 days) and the server decides when it stops working.
const REFRESH_COOKIE_MAX_AGE = 400 * 24 * 60 * 60 // Seconds

const COOKIE_FLAGS = ['Path=/', 'HttpOnly', 'Secure', 'SameSite=Strict']

export const setRefreshCookie = (reply: FastifyReply, token: string) => {
  reply.header(
    'Set-Cookie',
    [
      `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`,
      `Max-Age=${REFRESH_COOKIE_MAX_AGE}`,
      ...COOKIE_FLAGS,
    ].join('; ')
  )
}

export const getRefreshToken = (request: FastifyRequest): string | null => {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return null

  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=')
    if (separator === -1) continue
    if (cookie.slice(0, separator).trim() !== REFRESH_COOKIE_NAME) continue
    return decodeURIComponent(cookie.slice(separator + 1).trim())
  }

  return null
}
