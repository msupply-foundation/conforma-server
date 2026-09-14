import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../sessionCookies'
import type * as RoutesModule from '../routes'

const renewSession = jest.fn()
const getUserInfo = jest.fn()

/*
routes.ts reaches Postgres through databaseConnect, which opens a pool as a side
effect of being imported, so it is replaced to keep these as pure unit tests.

Mocked with `jest.doMock` + `require` rather than a hoisted `jest.mock` for the
same reason as userSessions.test.ts: ts-jest 26 hoists via `ts.getMutableClone`,
which TypeScript 5 removed, so `jest.mock` fails to compile. `doMock` is not
hoisted, so the require has to come after it.
*/
jest.doMock('../../database/databaseConnect', () => ({ __esModule: true, default: {} }))

jest.doMock('../userSessions', () => ({
  __esModule: true,
  renewSession,
  endSessions: jest.fn(),
  createSession: jest.fn(),
  setSessionOrg: jest.fn(),
  hashRefreshToken: (token: string) => `hash(${token})`,
}))

// Only here so the route can be shown NOT to call it -- see the last test
jest.doMock('../loginHelpers', () => ({
  __esModule: true,
  getUserInfo,
  getTokenData: jest.fn(),
  extractJWTfromHeader: jest.fn(),
  getSignedJWT: jest.fn(),
}))

const { routeHeartbeat }: typeof RoutesModule = require('../routes')

const USER_ID = 42
const REFRESH_TOKEN = 'refresh-abc123'

const requestWith = ({ refreshToken }: { refreshToken?: string } = {}) => ({
  auth: { userId: USER_ID, username: 'testuser' },
  headers: refreshToken ? { cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` } : {},
})

/*
Models the parts of a Fastify reply the route touches. Set-Cookie is APPENDED
rather than replaced, as Fastify does it -- clearAuthCookies depends on that
behaviour, so a mock that replaced would hide a real bug.
*/
const fakeReply = () => {
  const headers: Record<string, string | string[]> = {}
  const sent: any[] = []

  const reply: any = {
    statusCode: 200,
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
    send: (payload: any) => {
      sent.push(payload)
      return reply
    },
  }

  const cookies = (): string[] => {
    const value = headers['set-cookie']
    if (value === undefined) return []
    return Array.isArray(value) ? value : [value]
  }

  return {
    reply,
    body: () => sent[0],
    cookieNamed: (n: string) => cookies().filter((c) => c.startsWith(`${n}=`)),
  }
}

const liveSession = (expiresAt: Date) => ({
  tokenHash: `hash(${REFRESH_TOKEN})`,
  userId: USER_ID,
  orgId: null,
  sessionId: 'session-1',
  expiresAt,
})

afterEach(() => jest.clearAllMocks())

// -- the happy path --

test('Extends the session and reports the new expiry in unix seconds', async () => {
  const expiresAt = new Date('2026-09-07T11:30:00.000Z')
  renewSession.mockResolvedValue(liveSession(expiresAt))
  const { reply, body } = fakeReply()

  await routeHeartbeat(requestWith({ refreshToken: REFRESH_TOKEN }), reply)

  expect(reply.statusCode).toBe(200)
  expect(body()).toEqual({
    success: true,
    sessionExpiry: Math.floor(expiresAt.getTime() / 1000),
  })
})

/*
The point of the endpoint: reporting activity extends the session by the
standard window from now. Passing a third argument here would cap the
extension -- that is "/user-info"'s job, not this one's -- so the arity is the
assertion.
*/
test('Renews by the standard window, with no cap', async () => {
  renewSession.mockResolvedValue(liveSession(new Date()))
  const { reply } = fakeReply()

  await routeHeartbeat(requestWith({ refreshToken: REFRESH_TOKEN }), reply)

  expect(renewSession).toHaveBeenCalledTimes(1)
  expect(renewSession).toHaveBeenCalledWith(REFRESH_TOKEN, USER_ID)
})

// -- the session has gone --

/*
The case the preValidation hook cannot catch: the access token still verifies on
its own signature, so nothing has read the session table, and only this lookup
discovers the row is gone.
*/
test('Answers 401 when the token is still valid but the session has been revoked', async () => {
  renewSession.mockResolvedValue(null)
  const { reply, body } = fakeReply()

  await routeHeartbeat(requestWith({ refreshToken: REFRESH_TOKEN }), reply)

  expect(reply.statusCode).toBe(401)
  expect(body()).toEqual({ success: false, message: 'Session expired' })
})

// The browser cannot discard HttpOnly cookies itself, and one left in place goes
// on being presented -- and recognised by the expiry sweep -- after the app has
// returned to the login screen
test('Expires both cookies when the session has gone', async () => {
  renewSession.mockResolvedValue(null)
  const { reply, cookieNamed } = fakeReply()

  await routeHeartbeat(requestWith({ refreshToken: REFRESH_TOKEN }), reply)

  for (const name of [ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME]) {
    expect(cookieNamed(name)).toHaveLength(1)
    expect(cookieNamed(name)[0]).toContain('Max-Age=0')
  }
})

test('Answers 401 without touching the session table when no refresh cookie is presented', async () => {
  const { reply, body } = fakeReply()

  await routeHeartbeat(requestWith(), reply)

  expect(renewSession).not.toHaveBeenCalled()
  expect(reply.statusCode).toBe(401)
  expect(body()).toEqual({ success: false, message: 'Session expired' })
})

// -- what makes it worth having --

/*
The whole reason this exists rather than reusing "/user-info": that route
rebuilds the org list, template permissions, org permissions, admin status and a
fresh signed token on every call, which is far more than a call reporting that
someone is still working needs to do. If this ever starts doing the same, the
endpoint has lost its point.
*/
test('Does none of the user lookup work that /user-info does', async () => {
  renewSession.mockResolvedValue(liveSession(new Date()))
  const { reply } = fakeReply()

  await routeHeartbeat(requestWith({ refreshToken: REFRESH_TOKEN }), reply)

  expect(getUserInfo).not.toHaveBeenCalled()
})
