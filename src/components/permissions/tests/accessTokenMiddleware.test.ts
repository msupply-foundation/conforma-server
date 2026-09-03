import { FastifyReply, FastifyRequest } from 'fastify'
import { sign } from 'jsonwebtoken'
import config from '../../../config'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../sessionCookies'
import type * as MiddlewareModule from '../accessTokenMiddleware'

/*
The middleware reaches the database through getUserInfo and renewSession, so
both are replaced. Everything else -- token verification, cookie parsing, header
writing -- runs for real, since that is the behaviour under test.

jest.doMock + require rather than the usual hoisted jest.mock: ts-jest 26 hoists
via ts.getMutableClone, which TypeScript 5 removed, so jest.mock does not
compile. doMock is not hoisted, so the requires must come after it.
*/
jest.doMock('../../database/databaseConnect', () => ({ __esModule: true, default: {} }))

const renewSession = jest.fn()
jest.doMock('../userSessions', () => ({
  ...(jest.requireActual('../userSessions') as object),
  renewSession,
}))

const getUserInfo = jest.fn()
jest.doMock('../loginHelpers', () => ({
  ...(jest.requireActual('../loginHelpers') as object),
  getUserInfo,
}))

const { resolveAccessToken }: typeof MiddlewareModule = require('../accessTokenMiddleware')

const STAFF_USER = 2
const MINTED_JWT = 'newly.minted.jwt'

const LIVE_SESSION = {
  tokenHash: 'hash',
  userId: STAFF_USER,
  orgId: 7,
  sessionId: 'session-from-the-row',
  expiresAt: new Date(),
}

const token = (claims: object, expiresIn: string | number) =>
  sign({ aud: 'postgraphile', ...claims }, config.jwtSecret, { expiresIn }) as string

const validToken = (claims: object = { userId: STAFF_USER }) => token(claims, '1h')
const expiredToken = (claims: object = { userId: STAFF_USER }) => token(claims, -600)

/*
Models Fastify closely enough for what the middleware touches: `headers` and
`raw.headers` are the SAME object, because Fastify's `request.headers` getter
falls through to `raw.headers`. That is what makes writing to raw visible to
both PostGraphile and the REST tier.
*/
const fakeRequest = ({
  url = '/api/user-info',
  authorization,
  cookies = {},
}: {
  url?: string
  authorization?: string
  cookies?: Record<string, string>
} = {}) => {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')

  const headers: Record<string, string> = {}
  if (authorization) headers.authorization = authorization
  if (cookie) headers.cookie = cookie

  return { url, headers, raw: { headers } } as unknown as FastifyRequest
}

const fakeReply = () => {
  const headers: Record<string, string | string[]> = {}
  const reply = {
    header: (key: string, value: string) => {
      const name = key.toLowerCase()
      if (name === 'set-cookie' && headers[name] !== undefined) {
        const current = headers[name]
        headers[name] = Array.isArray(current) ? [...current, value] : [current, value]
      } else headers[name] = value
      return reply
    },
    getHeader: (key: string) => headers[key.toLowerCase()],
    removeHeader: (key: string) => {
      delete headers[key.toLowerCase()]
      return reply
    },
  }
  const cookies = (): string[] => {
    const value = headers['set-cookie']
    if (value === undefined) return []
    return Array.isArray(value) ? value : [value]
  }
  return { reply: reply as unknown as FastifyReply, cookies }
}

const authHeaderOf = (request: FastifyRequest) => request.raw.headers.authorization

beforeEach(() => {
  jest.clearAllMocks()
  getUserInfo.mockResolvedValue({ JWT: MINTED_JWT })
  renewSession.mockResolvedValue(LIVE_SESSION)
})

// -- a usable token short-circuits everything --

test('A valid Authorization header is left alone, and no session is touched', async () => {
  const jwt = validToken()
  const request = fakeRequest({ authorization: `Bearer ${jwt}` })
  const { reply, cookies } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(authHeaderOf(request)).toBe(`Bearer ${jwt}`)
  expect(renewSession).not.toHaveBeenCalled()
  expect(getUserInfo).not.toHaveBeenCalled()
  expect(cookies()).toHaveLength(0)
})

// The whole job of the middleware: PostGraphile reads only this header
test('A valid access cookie becomes an Authorization header', async () => {
  const jwt = validToken()
  const request = fakeRequest({ cookies: { [ACCESS_COOKIE_NAME]: jwt } })
  const { reply } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(authHeaderOf(request)).toBe(`Bearer ${jwt}`)
  expect(renewSession).not.toHaveBeenCalled()
})

// A valid token is verified by its signature alone -- it must never cost a
// database round trip, which is the point of keeping the access token stateless
test('A valid token never reaches the session table, even with a refresh cookie', async () => {
  const request = fakeRequest({
    cookies: { [ACCESS_COOKIE_NAME]: validToken(), [REFRESH_COOKIE_NAME]: 'refresh-value' },
  })

  await resolveAccessToken(request, fakeReply().reply)

  expect(renewSession).not.toHaveBeenCalled()
})

test('The header wins over the cookie, so scripted callers are unaffected', async () => {
  const headerToken = validToken({ userId: 99 })
  const request = fakeRequest({
    authorization: `Bearer ${headerToken}`,
    cookies: { [ACCESS_COOKIE_NAME]: validToken() },
  })

  await resolveAccessToken(request, fakeReply().reply)

  expect(authHeaderOf(request)).toBe(`Bearer ${headerToken}`)
})

// -- renewal --

test('An expired access cookie is silently replaced from the session', async () => {
  const request = fakeRequest({
    cookies: { [ACCESS_COOKIE_NAME]: expiredToken(), [REFRESH_COOKIE_NAME]: 'refresh-value' },
  })
  const { reply, cookies } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(renewSession).toHaveBeenCalledWith('refresh-value', STAFF_USER)
  expect(authHeaderOf(request)).toBe(`Bearer ${MINTED_JWT}`)
  expect(cookies()).toHaveLength(1)
  expect(cookies()[0]).toMatch(new RegExp(`^${ACCESS_COOKIE_NAME}=${MINTED_JWT};`))
})

/*
Missing and expired are deliberately the same case -- that is what lets a
machine client work with no code of its own. It sends only a provisioned refresh
token and never logs in.
*/
test('A refresh token with no access token at all still mints one', async () => {
  const request = fakeRequest({ cookies: { [REFRESH_COOKIE_NAME]: 'provisioned-token' } })
  const { reply, cookies } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(renewSession).toHaveBeenCalledWith('provisioned-token', undefined)
  expect(authHeaderOf(request)).toBe(`Bearer ${MINTED_JWT}`)
  expect(cookies()).toHaveLength(1)
})

/*
Renewal rebuilds every claim from the session row, never from the dead token.
The org drives org-granted permissions, and RLS evaluates sessionId directly for
public applicants -- reproduce either wrongly and the user silently loses access
to their own in-progress application.
*/
test('Claims are taken from the session row, not the expired token', async () => {
  const stale = expiredToken({ userId: STAFF_USER, orgId: 999, sessionId: 'stale-session' })
  const request = fakeRequest({
    cookies: { [ACCESS_COOKIE_NAME]: stale, [REFRESH_COOKIE_NAME]: 'refresh-value' },
  })

  await resolveAccessToken(request, fakeReply().reply)

  expect(getUserInfo).toHaveBeenCalledWith({
    userId: LIVE_SESSION.userId,
    orgId: LIVE_SESSION.orgId,
    sessionId: LIVE_SESSION.sessionId,
  })
})

test('A session with no org renews as no org, rather than as null', async () => {
  renewSession.mockResolvedValue({ ...LIVE_SESSION, orgId: null })
  const request = fakeRequest({ cookies: { [REFRESH_COOKIE_NAME]: 'refresh-value' } })

  await resolveAccessToken(request, fakeReply().reply)

  expect(getUserInfo.mock.calls[0][0].orgId).toBeUndefined()
})

// The userId only chooses how long to extend by. Reading it from a token whose
// signature was never checked would let a forged one ask for a longer window.
test('An unsigned or forged access token yields no user, so the window is not chosen by it', async () => {
  const forged = sign({ aud: 'postgraphile', userId: 1 }, 'not-the-real-secret', {
    expiresIn: -600,
  })
  const request = fakeRequest({
    cookies: { [ACCESS_COOKIE_NAME]: forged, [REFRESH_COOKIE_NAME]: 'refresh-value' },
  })

  await resolveAccessToken(request, fakeReply().reply)

  expect(renewSession).toHaveBeenCalledWith('refresh-value', undefined)
})

// -- nothing to work with --

test('No credentials at all is a no-op, not a rejection', async () => {
  const request = fakeRequest()
  const { reply, cookies } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(authHeaderOf(request)).toBeUndefined()
  expect(renewSession).not.toHaveBeenCalled()
  expect(cookies()).toHaveLength(0)
})

// A 401 from the hook would also reject legitimately public routes, so an
// expired or revoked session leaves the request unauthenticated for the route
// to reject in its own way.
test('A refresh token with no live session leaves the request unauthenticated', async () => {
  renewSession.mockResolvedValue(null)
  const request = fakeRequest({ cookies: { [REFRESH_COOKIE_NAME]: 'revoked-token' } })
  const { reply } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(authHeaderOf(request)).toBeUndefined()
  expect(getUserInfo).not.toHaveBeenCalled()
})

/*
The cookies can no longer resolve to anything, and the client can't clear them
itself -- HttpOnly means script can neither read nor overwrite them. Doing it
here covers the case the logout route can't: a client that notices its session
has ended has, by then, no valid access token to authenticate a logout with.
*/
test('A refresh token with no live session has its cookies expired', async () => {
  renewSession.mockResolvedValue(null)
  const request = fakeRequest({ cookies: { [REFRESH_COOKIE_NAME]: 'revoked-token' } })
  const { reply, cookies } = fakeReply()

  await resolveAccessToken(request, reply)

  const expired = cookies().map(String)
  expect(expired).toHaveLength(2)
  expect(expired.every((cookie) => cookie.includes('Max-Age=0'))).toBe(true)
  expect(expired.some((cookie) => cookie.startsWith(`${ACCESS_COOKIE_NAME}=`))).toBe(true)
  expect(expired.some((cookie) => cookie.startsWith(`${REFRESH_COOKIE_NAME}=`))).toBe(true)
})

// Login issues its own cookies; renewing an older session first would race with
// them on the same reply
test('Login is skipped entirely, even when cookies are present', async () => {
  const request = fakeRequest({
    url: '/api/public/login',
    cookies: { [ACCESS_COOKIE_NAME]: expiredToken(), [REFRESH_COOKIE_NAME]: 'refresh-value' },
  })
  const { reply, cookies } = fakeReply()

  await resolveAccessToken(request, reply)

  expect(renewSession).not.toHaveBeenCalled()
  expect(authHeaderOf(request)).toBeUndefined()
  expect(cookies()).toHaveLength(0)
})

// -- failure --

// This hook runs on every request, including public ones, so a database problem
// must not become a 500 for the whole server
test('A failure is swallowed and the request continues unauthenticated', async () => {
  renewSession.mockRejectedValue(new Error('database is down'))
  const request = fakeRequest({ cookies: { [REFRESH_COOKIE_NAME]: 'refresh-value' } })

  await expect(resolveAccessToken(request, fakeReply().reply)).resolves.toBeUndefined()
  expect(authHeaderOf(request)).toBeUndefined()
})
