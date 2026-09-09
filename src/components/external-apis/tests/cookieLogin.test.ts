import type * as AxiosModule from 'axios'
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type * as RoutesModule from '../routes'
import type * as AuthHeadersModule from '../authHeaders'
import config from '../../../config'
import { resetCookieJars } from '../cookieJar'
import { ApiAuthentication, CookieLoginAuthentication } from '../types'

/*
Everything the handler reaches for that is not the relay itself is replaced, so
these run as pure unit tests against a simulated far server.

Mocked with `jest.doMock` + `require` rather than a hoisted `jest.mock`, for the
same reason as the permissions tests: ts-jest 26 hoists via
`ts.getMutableClone`, which TypeScript 5 removed, so `jest.mock` fails to
compile. `doMock` is not hoisted, so anything that imports axios has to be
required after it.
*/
jest.doMock('axios', () => ({
  __esModule: true,
  ...(jest.requireActual('axios') as object),
  default: jest.fn(),
}))
jest.doMock('../../database/databaseConnect', () => ({
  __esModule: true,
  default: { gqlQuery: jest.fn() },
}))
jest.doMock('../../actions', () => ({ __esModule: true, getApplicationData: jest.fn() }))
jest.doMock('../../permissions/loginHelpers', () => ({
  __esModule: true,
  getPermissionNamesFromJWT: jest.fn(async () => ({ permissionNames: [] })),
  getUserInfo: jest.fn(async () => ({ user: { userId: 1 } })),
}))
jest.doMock('../helpers', () => ({
  __esModule: true,
  constructQueryObject: jest.fn(async (requestQuery = {}) => requestQuery),
  validateResult: jest.fn(async () => true),
}))

const { default: axiosDefault, AxiosError }: typeof AxiosModule = require('axios')
const mockedAxios = axiosDefault as unknown as jest.Mock
const { routeAccessExternalApi }: typeof RoutesModule = require('../routes')
const { sessionFor }: typeof AuthHeadersModule = require('../authHeaders')

const API = 'mSupply'
const BASE_URL = 'http://msupply.test/api/v4/'
const LOGIN_URL = `${BASE_URL}login`
const ITEM_URL = `${BASE_URL}item`
const SESSION_COOKIE = 'sessionid'
const PASSWORD = 's3cret-pw'
const LOGIN_RESPONSE_BODY = 'login-response-body-must-not-leak'

const configure = (overrides: Partial<CookieLoginAuthentication> = {}, baseUrl = BASE_URL) => {
  config.externalApiConfigs = {
    [API]: {
      baseUrl,
      authentication: {
        type: 'CookieLogin',
        login: {
          url: 'login',
          body: { username: 'demo', password: 'env.MSUPPLY_PW', loginType: 'user' },
        },
        ...overrides,
      },
      routes: { item: { method: 'get', url: 'item' } },
    },
  }
}

const authentication = () => config.externalApiConfigs![API].authentication

/*
The far server, as much of it as the relay can see: the sessions it currently
accepts, what its login will hand out next, and how it turns a request away.
Session ids are distinctive strings so a test can assert none was ever logged.
*/
let accepted: Set<string>
let toMint: string[]
let minted: number
let rejectWith: number
let onLogin: 'succeed' | 'reject' | 'unreachable' | 'no-cookie'
let extraSetCookieOnReject: string[]
let extraSetCookieOnLogin: string[]

const nextSessionId = () => {
  minted += 1
  return toMint.shift() ?? `session-secret-${minted}`
}

const setCookie = (name: string, value: string) => `${name}=${value}; Path=/; HttpOnly`

const ok = (
  request: AxiosRequestConfig,
  data: unknown,
  headers: { [key: string]: unknown } = {}
): AxiosResponse =>
  ({ status: 200, statusText: 'OK', data, headers, config: request }) as AxiosResponse

// What axios throws for a non-2xx: the response body is a stand-in for whatever
// the far server said, which must never reach our client or our logs
const rejected = (request: AxiosRequestConfig, status: number, headers = {}) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    request as InternalAxiosRequestConfig,
    {},
    {
      status,
      statusText: 'Rejected',
      data: LOGIN_RESPONSE_BODY,
      headers,
      config: request,
    } as AxiosResponse
  )

const unreachable = (request: AxiosRequestConfig) =>
  new AxiosError('connect ECONNREFUSED', 'ECONNREFUSED', request as InternalAxiosRequestConfig)

const cookieSent = (request: AxiosRequestConfig) => (request.headers?.Cookie as string) ?? ''
const cookiesSent = (request: AxiosRequestConfig) => cookieSent(request).split('; ').filter(Boolean)
const isLogin = (request: AxiosRequestConfig) => request.url === LOGIN_URL
const isItem = (request: AxiosRequestConfig) => request.url === ITEM_URL

const farServer = async (request: AxiosRequestConfig): Promise<AxiosResponse> => {
  if (isLogin(request)) {
    if (onLogin === 'reject') throw rejected(request, 401)
    if (onLogin === 'unreachable') throw unreachable(request)
    if (onLogin === 'no-cookie') return ok(request, { token: LOGIN_RESPONSE_BODY })

    const id = nextSessionId()
    accepted.add(id)
    return ok(
      request,
      { token: LOGIN_RESPONSE_BODY },
      {
        'set-cookie': [setCookie(SESSION_COOKIE, id), ...extraSetCookieOnLogin],
      }
    )
  }

  const live = cookiesSent(request).some((cookie) =>
    Array.from(accepted).some((id) => cookie === `${SESSION_COOKIE}=${id}`)
  )
  if (live) return ok(request, { item: 'paracetamol' })
  throw rejected(request, rejectWith, { 'set-cookie': extraSetCookieOnReject })
}

// What went over the wire
const calls = () => mockedAxios.mock.calls.map(([request]) => request as AxiosRequestConfig)
const logins = () => calls().filter(isLogin)
const relays = () => calls().filter(isItem)

/*
A far server that answers only when told to, so a test can choose the order in
which responses land -- which is what the late-rejection cases are about
*/
type Pending = { request: AxiosRequestConfig; settle: () => Promise<void> }
let pending: Pending[]

const flush = () => new Promise((resolve) => setImmediate(resolve))

const deferResponses = () => {
  pending = []
  mockedAxios.mockImplementation(
    (request: AxiosRequestConfig) =>
      new Promise((resolve, reject) => {
        pending.push({ request, settle: () => farServer(request).then(resolve, reject) })
      })
  )
}

const settle = async (matches: (request: AxiosRequestConfig) => boolean) => {
  const index = pending.findIndex(({ request }) => matches(request))
  if (index === -1) throw new Error('No such request is pending')
  const [next] = pending.splice(index, 1)
  await next.settle()
  await flush()
}

const settleAll = async () => {
  while (pending.length) await settle(() => true)
}

const fakeReply = () => {
  const reply = { statusCode: 200, payload: undefined as unknown }
  return Object.assign(reply, {
    status: (code: number) => {
      reply.statusCode = code
      return reply
    },
    send: (payload: unknown) => {
      reply.payload = payload
      return reply
    },
  })
}

const relay = async () => {
  const reply = fakeReply()
  await routeAccessExternalApi(
    {
      params: { name: API, route: 'item' },
      query: {},
      headers: {},
      auth: { userId: 1, orgId: 1 },
    } as any,
    reply as any
  )
  return reply
}

const relayMany = (count: number) => Promise.all(Array.from({ length: count }, relay))

describe('CookieLogin', () => {
  const originalEnv = process.env
  let logged: string[]

  beforeEach(() => {
    process.env = { ...originalEnv, MSUPPLY_PW: PASSWORD }
    resetCookieJars()
    configure()

    accepted = new Set()
    toMint = []
    minted = 0
    rejectWith = 401
    onLogin = 'succeed'
    extraSetCookieOnReject = []
    extraSetCookieOnLogin = []

    mockedAxios.mockReset()
    mockedAxios.mockImplementation(farServer)

    logged = []
    jest.spyOn(console, 'log').mockImplementation((...args) => logged.push(args.join(' ')))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    // Nothing that went over the wire in either direction may appear in a log
    const output = logged.join('\n')
    expect(output).not.toContain(PASSWORD)
    expect(output).not.toContain(LOGIN_RESPONSE_BODY)
    expect(output).not.toContain('session-secret')
  })

  afterAll(() => {
    process.env = originalEnv
  })

  const expectSuccess = (reply: { statusCode: number; payload: unknown }) => {
    expect(reply.statusCode).toBe(200)
    expect(reply.payload).toEqual({ item: 'paracetamol' })
  }

  describe('logging in and re-logging in', () => {
    it('logs in once BEFORE the first relay, which then carries the cookie and is not rejected', async () => {
      const reply = await relay()

      expectSuccess(reply)
      expect(calls().map((request) => request.url)).toEqual([LOGIN_URL, ITEM_URL])
      expect(cookieSent(relays()[0])).toBe(`${SESSION_COOKIE}=session-secret-1`)
    })

    it('sends the login as configured, with the env-substituted body', async () => {
      await relay()

      const [login] = logins()
      expect(login.method).toBe('post')
      expect(login.data).toEqual({ username: 'demo', password: PASSWORD, loginType: 'user' })
    })

    it('does not log in again while the session is warm', async () => {
      await relay()
      const reply = await relay()

      expectSuccess(reply)
      expect(logins()).toHaveLength(1)
      expect(relays()).toHaveLength(2)
    })

    it('logs in exactly once for a burst of concurrent requests against a cold session', async () => {
      const replies = await relayMany(20)

      replies.forEach(expectSuccess)
      expect(logins()).toHaveLength(1)
      expect(relays()).toHaveLength(20)
    })

    it('logs in again when the session expires, inside the request that hit it', async () => {
      await relay()
      accepted.clear()

      const reply = await relay()

      expectSuccess(reply)
      expect(logins()).toHaveLength(2)
      expect(cookieSent(relays()[2])).toBe(`${SESSION_COOKIE}=session-secret-2`)
    })

    it('logs in exactly once for a burst of concurrent rejections after the session expires', async () => {
      await relay()
      accepted.clear()

      const replies = await relayMany(20)

      replies.forEach(expectSuccess)
      expect(logins()).toHaveLength(2)
      // 20 rejections, 20 replays
      expect(relays()).toHaveLength(1 + 40)
    })

    // Step 9: the second rejection lands AFTER the first has already logged
    // in, so there is no login in flight to join -- it must notice one has
    // completed and retry with what that stored
    it('retries a rejection that lands after a login has completed, without a second login', async () => {
      await relay()
      accepted.clear()
      deferResponses()

      const first = relay()
      const second = relay()
      await flush()
      expect(pending.map(({ request }) => cookieSent(request))).toEqual([
        `${SESSION_COOKIE}=session-secret-1`,
        `${SESSION_COOKIE}=session-secret-1`,
      ])

      await settle(isItem) // first rejection → starts the login
      expect(pending.some(({ request }) => isLogin(request))).toBe(true)
      await settle(isLogin) // login completes → first request replays
      await settle((request) => isItem(request) && cookieSent(request).includes('session-secret-1'))
      await settleAll()

      expectSuccess(await first)
      expectSuccess(await second)
      expect(logins()).toHaveLength(2)
      expect(relays().slice(-2).map(cookieSent)).toEqual([
        `${SESSION_COOKIE}=session-secret-2`,
        `${SESSION_COOKIE}=session-secret-2`,
      ])
    })

    // Comparing the cookie sent against the cookie stored would find them equal
    // here, and log in again for every late rejection
    it('still de-duplicates late rejections when the login hands back the identical cookie', async () => {
      await relay()
      accepted.clear()
      toMint = ['session-secret-1']
      deferResponses()

      const first = relay()
      const second = relay()
      await flush()

      await settle(isItem)
      await settle(isLogin)
      await settle(isItem)
      await settleAll()

      expectSuccess(await first)
      expectSuccess(await second)
      expect(logins()).toHaveLength(2)
    })

    // recordCookies leaves the generation alone, or this would read as a repair
    it('logs in when the server expires the cookie on the rejection itself', async () => {
      await relay()
      accepted.clear()
      extraSetCookieOnReject = [`${SESSION_COOKIE}=; Max-Age=0; Path=/`]

      const reply = await relay()

      expectSuccess(reply)
      expect(logins()).toHaveLength(2)
      expect(cookieSent(relays()[2])).toBe(`${SESSION_COOKIE}=session-secret-2`)
    })

    // Step 8: an API that answers 401 for a reason login cannot fix must not
    // loop 401 → login → 401 → login
    it('returns the rejection when the replayed request is rejected again', async () => {
      // The far server accepts nothing, however often we log in
      mockedAxios.mockImplementation(async (request: AxiosRequestConfig) => {
        if (isLogin(request)) return farServer(request)
        throw rejected(request, 401)
      })

      const reply = await relay()

      expect(reply.statusCode).toBe(401)
      expect(reply.payload).toBe('External API error: Request failed with status code 401')
      expect(logins()).toHaveLength(2)
      expect(relays()).toHaveLength(2)
    })

    it('treats a status outside reloginOn as an ordinary error', async () => {
      await relay()
      accepted.clear()
      rejectWith = 500

      const reply = await relay()

      expect(reply.statusCode).toBe(500)
      expect(logins()).toHaveLength(1)
    })

    it('honours a configured reloginOn of "403", and then ignores 401', async () => {
      configure({ reloginOn: '403' })
      await relay()
      accepted.clear()

      rejectWith = 403
      expectSuccess(await relay())
      expect(logins()).toHaveLength(2)

      accepted.clear()
      rejectWith = 401
      expect((await relay()).statusCode).toBe(401)
      expect(logins()).toHaveLength(2)
    })

    it.each([
      ['strings', ['401', '403']],
      ['numbers', [401, 403]],
    ])('honours a reloginOn list of %s', async (_, reloginOn) => {
      configure({ reloginOn })
      await relay()

      for (const status of [401, 403]) {
        accepted.clear()
        rejectWith = status
        expectSuccess(await relay())
      }
      expect(logins()).toHaveLength(3)
    })
  })

  describe('login failure and backoff', () => {
    it('answers 502 with a generic message, and nothing of the login response reaches the client', async () => {
      onLogin = 'reject'

      const reply = await relay()

      expect(reply.statusCode).toBe(502)
      expect(reply.payload).toBe(`Unable to log in to external API: ${API}`)
      expect(relays()).toHaveLength(0)
    })

    it('answers 502 when the login endpoint is unreachable, and says so in the log', async () => {
      onLogin = 'unreachable'

      const reply = await relay()

      expect(reply.statusCode).toBe(502)
      expect(logged.join('\n')).toContain('unreachable (ECONNREFUSED)')
    })

    it('distinguishes a rejected login in the log, by status only', async () => {
      onLogin = 'reject'

      await relay()

      expect(logged.join('\n')).toContain('rejected with 401')
    })

    it('treats a 2xx login that sets no cookie as a failure', async () => {
      onLogin = 'no-cookie'

      const reply = await relay()

      expect(reply.statusCode).toBe(502)
      expect(relays()).toHaveLength(0)
      expect(logged.join('\n')).toContain('set no cookie')

      // ...and one that starts the backoff like any other
      expect((await relay()).statusCode).toBe(502)
      expect(logins()).toHaveLength(1)
    })

    it('leaves the stored cookies exactly as they were', async () => {
      await relay()
      accepted.clear()
      onLogin = 'reject'

      expect((await relay()).statusCode).toBe(502)

      // The next request still presents what we held before the failed login
      await relay()
      expect(cookieSent(relays()[2])).toBe(`${SESSION_COOKIE}=session-secret-1`)
    })

    // The rejection that provoked the login may have been about one route, not
    // the session, so a live session must survive a login blip
    it('inside the backoff window, a request whose cookies are still accepted succeeds', async () => {
      await relay()
      accepted.clear()
      onLogin = 'reject'
      expect((await relay()).statusCode).toBe(502)

      accepted.add('session-secret-1')
      const reply = await relay()

      expectSuccess(reply)
      expect(logins()).toHaveLength(2)
    })

    it('inside the backoff window, a request whose cookies are rejected gets 502 with no login attempt', async () => {
      await relay()
      accepted.clear()
      onLogin = 'reject'
      expect((await relay()).statusCode).toBe(502)

      const reply = await relay()

      expect(reply.statusCode).toBe(502)
      expect(logins()).toHaveLength(2)
    })

    it('inside the backoff window with nothing stored, gets 502 with no relay and no login attempt', async () => {
      onLogin = 'reject'
      expect((await relay()).statusCode).toBe(502)

      const reply = await relay()

      expect(reply.statusCode).toBe(502)
      expect(logins()).toHaveLength(1)
      expect(relays()).toHaveLength(0)
    })

    it('logs in again once the backoff window has elapsed', async () => {
      let now = 1_000_000
      jest.spyOn(Date, 'now').mockImplementation(() => now)
      onLogin = 'reject'
      expect((await relay()).statusCode).toBe(502)

      onLogin = 'succeed'
      now += 29_999
      expect((await relay()).statusCode).toBe(502)
      expect(logins()).toHaveLength(1)

      now += 2
      expectSuccess(await relay())
      expect(logins()).toHaveLength(2)
    })

    it('honours a configured loginFailTimeout, read as seconds', async () => {
      configure({ loginFailTimeout: 5 })
      let now = 1_000_000
      jest.spyOn(Date, 'now').mockImplementation(() => now)
      onLogin = 'reject'
      expect((await relay()).statusCode).toBe(502)

      onLogin = 'succeed'
      now += 4_999
      expect((await relay()).statusCode).toBe(502)
      expect(logins()).toHaveLength(1)

      now += 2
      expectSuccess(await relay())
      expect(logins()).toHaveLength(2)
    })

    it('does not start a second login for a request arriving as the first one fails', async () => {
      onLogin = 'reject'
      deferResponses()

      const first = relay()
      await flush()
      const [login] = pending
      pending = []

      // Settled, and the next request made in the same turn -- before any
      // reaction to the failure has had the chance to run
      const settled = login.settle()
      const second = relay()
      await settled
      await flush()

      expect((await first).statusCode).toBe(502)
      expect((await second).statusCode).toBe(502)
      expect(logins()).toHaveLength(1)
    })

    it('shares one failed login between concurrent cold requests', async () => {
      onLogin = 'reject'

      const replies = await relayMany(5)

      replies.forEach((reply) => expect(reply.statusCode).toBe(502))
      expect(logins()).toHaveLength(1)
    })

    // Both live on the same record, keyed by the credential
    it('orphans the backoff along with the session when the credential is corrected', async () => {
      onLogin = 'reject'
      expect((await relay()).statusCode).toBe(502)

      process.env.MSUPPLY_PW = 'corrected-pw'
      onLogin = 'succeed'
      const reply = await relay()

      expectSuccess(reply)
      expect(logins()).toHaveLength(2)
      expect(logins()[1].data).toMatchObject({ password: 'corrected-pw' })
    })

    it('orphans a live session when the credential changes', async () => {
      await relay()

      process.env.MSUPPLY_PW = 'rotated-pw'
      await relay()

      expect(logins()).toHaveLength(2)
      expect(cookieSent(relays()[1])).toBe(`${SESSION_COOKIE}=session-secret-2`)
    })

    it('keeps a live session when only reloginOn or loginFailTimeout change', async () => {
      await relay()

      configure({ reloginOn: ['401', '403'], loginFailTimeout: 5 })
      expectSuccess(await relay())

      expect(logins()).toHaveLength(1)
    })
  })

  describe('cookies and configuration', () => {
    it("takes the cookie's name from the login's Set-Cookie, with nothing configured", async () => {
      mockedAxios.mockImplementation(async (request: AxiosRequestConfig) => {
        if (isLogin(request)) {
          return ok(request, {}, { 'set-cookie': [setCookie('JSESSIONID', 'abc')] })
        }
        return ok(request, { item: 'paracetamol' })
      })

      await relay()

      expect(cookieSent(relays()[0])).toBe('JSESSIONID=abc')
    })

    it('replays every cookie a login sets', async () => {
      extraSetCookieOnLogin = [setCookie('csrf', 'xyz')]

      await relay()

      expect(cookiesSent(relays()[0])).toEqual([`${SESSION_COOKIE}=session-secret-1`, 'csrf=xyz'])
    })

    it('records a Set-Cookie on a rejected response', async () => {
      await relay()
      accepted.clear()
      extraSetCookieOnReject = [setCookie('tracking', 't1')]

      await relay()

      expect(cookiesSent(relays()[2])).toEqual(
        expect.arrayContaining([`${SESSION_COOKIE}=session-secret-2`, 'tracking=t1'])
      )
    })

    it('drops a cookie the server expires with Max-Age=0', async () => {
      extraSetCookieOnLogin = [setCookie('extra', 'e1')]
      mockedAxios.mockImplementation(async (request: AxiosRequestConfig) => {
        const response = await farServer(request)
        if (isItem(request)) response.headers = { 'set-cookie': ['extra=; Max-Age=0; Path=/'] }
        return response
      })

      await relay()
      expect(cookiesSent(relays()[0])).toEqual([`${SESSION_COOKIE}=session-secret-1`, 'extra=e1'])

      await relay()
      expect(cookiesSent(relays()[1])).toEqual([`${SESSION_COOKIE}=session-secret-1`])
    })

    it('holds the session under a hash, with the password nowhere in the store', async () => {
      await relay()

      const session = sessionFor(authentication(), API)!
      expect(session.fingerprint).toMatch(/^[0-9a-f]{64}$/)
      expect(JSON.stringify(session)).not.toContain(PASSWORD)
      expect(Array.from(session.cookies.values())).toEqual(['session-secret-1'])
    })

    it('fails loudly on an unset env variable in the login body, without calling out', async () => {
      delete process.env.MSUPPLY_PW

      const reply = await relay()

      expect(reply.statusCode).toBe(500)
      expect(reply.payload).toBe('Server error: Environment variable not set: MSUPPLY_PW')
      expect(mockedAxios).not.toHaveBeenCalled()
    })

    it.each([
      ['http://msupply.test/api/v4', 'login', 'item'],
      ['http://msupply.test/api/v4/', '/login', '/item'],
      ['http://msupply.test/api/v4', '/login', '/item'],
    ])('resolves urls against a base of %s', async (baseUrl, loginUrl, itemUrl) => {
      configure({ login: { url: loginUrl, body: {} } }, baseUrl)
      config.externalApiConfigs![API].routes.item.url = itemUrl

      expectSuccess(await relay())

      expect(calls().map((request) => request.url)).toEqual([LOGIN_URL, ITEM_URL])
    })

    it('passes a rejection straight through for an auth type with no login', async () => {
      const bearer: ApiAuthentication = { type: 'Bearer', token: 'abc' }
      config.externalApiConfigs![API].authentication = bearer

      const reply = await relay()

      expect(reply.statusCode).toBe(401)
      expect(calls()).toHaveLength(1)
    })
  })
})
