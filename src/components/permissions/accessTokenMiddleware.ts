import { FastifyReply, FastifyRequest } from 'fastify'
import { extractJWTfromHeader, getTokenData, getUserInfo } from './loginHelpers'
import { getAccessToken, getRefreshToken, setAccessCookie } from './sessionCookies'
import { renewSession } from './userSessions'
import { errorMessage } from '../utilityFunctions'

/*
Turns the access cookie into an Authorization header, and silently replaces it
when it has run out -- see kdd/auth-token-lifecycle/draft-kdd.md §3 and §5.

PostGraphile 4 reads the JWT *only* from `Authorization: Bearer`, with no cookie
source available in library mode, and the REST tier's preValidation hook reads
the same header. So one hook in front of both translates cookie to header, and
neither surface needs to know that cookies exist.

The renewal rule is "no usable access token, but a live session -> mint one",
where **missing and expired are the same case**. That is what lets a machine
client work with no code of its own: it sends only a provisioned refresh token
and never logs in, and a request that never carried an access cookie satisfies
the rule identically to one whose cookie has aged out (§4).

Renewal is triggered by rejection, not by a clock, so it can fire on any
request -- which is why the refresh cookie is Path=/ rather than scoped to one
endpoint.
*/

// PostGraphile reads the raw Node request (via getNodeServerRequest), and
// Fastify's own `request.headers` getter falls through to the same object, so
// writing here is visible to both surfaces.
const setAuthorizationHeader = (request: FastifyRequest, token: string) => {
  request.raw.headers.authorization = `Bearer ${token}`
}

const isUsable = async (token: string) => !!token && !(await getTokenData(token)).error

export const resolveAccessToken = async (request: FastifyRequest, reply: FastifyReply) => {
  // Logging in issues its own cookies; renewing an older session first would
  // just race with them on the same reply.
  if (request.url.startsWith('/api/public/login')) return

  try {
    // A token presented in the header wins, so scripted callers and internal
    // requests keep working exactly as before.
    const presented = extractJWTfromHeader(request) || getAccessToken(request) || ''
    if (await isUsable(presented)) return setAuthorizationHeader(request, presented)

    const refreshToken = getRefreshToken(request)
    if (!refreshToken) return

    // An expired token still carries an authentic userId -- its signature
    // verifies, only its expiry has passed -- and that says how long to extend
    // the session by. Verified rather than merely decoded, so a forged token
    // can't ask for the longer public-account window. A caller that sent no
    // access token at all (a machine client) leaves this undefined and gets the
    // standard window, which GREATEST makes harmless.
    const userId = presented
      ? (await getTokenData(presented, { ignoreExpiration: true })).userId
      : undefined

    // Reads the session and extends it in one statement, so a logout can't slip
    // in between the two and have us mint a token for a revoked session.
    // Minting is what extends expiry, which is why this is the same call.
    const session = await renewSession(refreshToken, userId)
    // No live session: leave the request unauthenticated and let the route
    // reject it. A 401 here would also reject public routes.
    if (!session) return

    // Every claim comes from the session row, not from the expired token: the
    // org because RLS reads org-granted permissions, and the sessionId because
    // RLS evaluates it directly for public applicants, so it has to be
    // reproduced byte-for-byte or an applicant loses access to their own
    // in-progress application.
    const { JWT } = await getUserInfo({
      userId: session.userId,
      orgId: session.orgId ?? undefined,
      sessionId: session.sessionId,
    })

    setAccessCookie(reply, JWT)
    setAuthorizationHeader(request, JWT)
  } catch (err) {
    // This hook runs on every request, including public ones, so a failure here
    // must not turn into a 500 for the whole server. The request continues
    // unauthenticated and the route decides what to do about it.
    console.log('Problem resolving access token:', errorMessage(err))
  }
}
