import type * as AxiosModule from 'axios'
import type * as LoginModule from '../login'
import { getSession, resetCookieJars } from '../cookieJar'
import { CookieLoginAuthentication } from '../types'

/*
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

const axios: typeof AxiosModule = require('axios')
const mockedAxios = axios.default as unknown as jest.Mock
const {
  ensureLoggedIn,
  ExternalLoginError,
  reloginStatuses,
  resolveLogin,
  warnAboutReloginOn,
}: typeof LoginModule = require('../login')

const API = 'mSupply'
const BASE_URL = 'http://msupply.test/api/v4/'

const auth: CookieLoginAuthentication = {
  type: 'CookieLogin',
  login: {
    url: 'login',
    body: { username: 'demo', password: 'env.MSUPPLY_PW', loginType: 'user' },
  },
}

/*
The request-level behaviour -- one login per burst, replay once, backoff -- is
covered in cookieLogin.test.ts through the route handler. These are the pieces
on their own.
*/
describe('login', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, MSUPPLY_PW: 's3cret-pw' }
    resetCookieJars()
    mockedAxios.mockReset()
    jest.spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => jest.restoreAllMocks())

  afterAll(() => {
    process.env = originalEnv
  })

  describe('resolveLogin', () => {
    it('substitutes env references in the body and defaults the method to post', () => {
      expect(resolveLogin(auth)).toEqual({
        url: 'login',
        method: 'post',
        body: { username: 'demo', password: 's3cret-pw', loginType: 'user' },
      })
    })

    // Better than sending the literal reference as the password
    it('throws on an env reference whose variable is unset', () => {
      delete process.env.MSUPPLY_PW

      expect(() => resolveLogin(auth)).toThrow('Environment variable not set: MSUPPLY_PW')
    })

    // A JSON author will leave a numeric field unquoted, and substitution has
    // nothing to do to a value that cannot hold an "env." reference
    it('sends a body value that is not a string as written', () => {
      const login = { url: 'login', body: { username: 'demo', loginType: 1, remember: false } }

      expect(resolveLogin({ ...auth, login } as CookieLoginAuthentication).body).toEqual({
        username: 'demo',
        loginType: 1,
        remember: false,
      })
    })

    // Reading `.match` of a missing url would reach the client as an opaque
    // 500 on every request, since the fingerprint resolves the login too
    it('names the missing url rather than failing on it', () => {
      expect(() => resolveLogin({ ...auth, login: {} } as CookieLoginAuthentication)).toThrow(
        'requires a string "login.url"'
      )
    })
  })

  describe('reloginStatuses', () => {
    it('defaults to 401', () => {
      expect(reloginStatuses(auth)).toEqual(new Set([401]))
    })

    it.each([
      ['a string', '403', [403]],
      ['a list of strings', ['401', '403'], [401, 403]],
      ['a bare number', 401, [401]],
      ['a list of numbers', [401, 403], [401, 403]],
    ])('accepts %s', (_, reloginOn, expected) => {
      expect(reloginStatuses({ ...auth, reloginOn } as CookieLoginAuthentication)).toEqual(
        new Set(expected)
      )
    })

    // Hand-written JSON, so anything can turn up. Coercing it would give a
    // set that matches no response, and a session that is never repaired.
    it.each([
      ['a word', 'unauthorized', []],
      ['a comma-separated string', '401, 403', []],
      ['an empty string', '', []],
      ['an object', {}, []],
      ['a number outside the status range', 0, []],
      ['the unusable entry of a mixed list, keeping the rest', ['401', 'nope', 403], [401, 403]],
    ])('drops %s', (_, reloginOn, expected) => {
      expect(reloginStatuses({ ...auth, reloginOn } as CookieLoginAuthentication)).toEqual(
        new Set(expected)
      )
    })

    // Only `undefined` reaches a destructuring default, so an explicit null
    // used to coerce to the status 0 and silently disable re-login
    it('reads an explicit null as "not configured"', () => {
      expect(
        reloginStatuses({ ...auth, reloginOn: null } as unknown as CookieLoginAuthentication)
      ).toEqual(new Set([401]))
    })

    // "Never re-login" is a coherent thing to ask for
    it('leaves an empty list empty', () => {
      expect(reloginStatuses({ ...auth, reloginOn: [] })).toEqual(new Set())
    })
  })

  describe('warnAboutReloginOn', () => {
    let logged: string[]

    const configFor = (reloginOn: unknown) =>
      ({
        mSupply: { baseUrl: BASE_URL, routes: {}, authentication: { ...auth, reloginOn } },
      }) as unknown as Parameters<typeof warnAboutReloginOn>[0]

    beforeEach(() => {
      logged = []
      jest.spyOn(console, 'log').mockImplementation((...args) => logged.push(args.join(' ')))
    })

    const output = () => logged.join('\n')

    it('names the API and the unusable value', () => {
      warnAboutReloginOn(configFor('unauthorized'))

      expect(output()).toContain('external API "mSupply"')
      expect(output()).toContain('"unauthorized"')
    })

    it('says a lapsed session will never be repaired when nothing usable is left', () => {
      warnAboutReloginOn(configFor(['nope', '']))

      expect(output()).toContain('never be repaired')
    })

    it('does not claim that when a usable status remains', () => {
      warnAboutReloginOn(configFor(['401', 'nope']))

      expect(output()).toContain('"nope"')
      expect(output()).not.toContain('never be repaired')
    })

    it.each([
      ['the default', undefined],
      ['a valid list', ['401', 403]],
      ['an empty list', []],
    ])('says nothing for %s', (_, reloginOn) => {
      warnAboutReloginOn(configFor(reloginOn))

      expect(output()).toBe('')
    })

    it('ignores auth types that have no reloginOn', () => {
      warnAboutReloginOn({
        peer: { baseUrl: BASE_URL, routes: {}, authentication: { type: 'Bearer', token: 'abc' } },
      })

      expect(output()).toBe('')
    })
  })

  describe('ensureLoggedIn', () => {
    // `failedUntil` is set before the promise settles and checked before the
    // promise is looked at, so a request arriving in the gap between the
    // failure and the promise being cleared starts nothing
    it('does not start a login while a failed one is still on the session', async () => {
      const session = getSession(API, 'fingerprint')
      session.failedUntil = Date.now() + 30_000
      const failed = Promise.reject(new ExternalLoginError(API))
      failed.catch(() => undefined)
      session.loginPromise = failed

      await expect(ensureLoggedIn(session, API, auth, BASE_URL)).rejects.toThrow(ExternalLoginError)
      expect(mockedAxios).not.toHaveBeenCalled()
    })

    // A login that fails before its first await must not leave a settled
    // promise on the session for ever
    it('clears the promise after a login that fails synchronously', async () => {
      delete process.env.MSUPPLY_PW
      const session = getSession(API, 'fingerprint')

      await expect(ensureLoggedIn(session, API, auth, BASE_URL)).rejects.toThrow(
        'Environment variable not set: MSUPPLY_PW'
      )
      expect(session.loginPromise).toBeUndefined()
      expect(session.failedUntil).toBeUndefined()
    })

    it('issues the configured method to the login url with the resolved body', async () => {
      mockedAxios.mockResolvedValue({
        status: 200,
        headers: { 'set-cookie': ['sessionid=abc; Path=/'] },
        data: {},
      })
      const session = getSession(API, 'fingerprint')

      await ensureLoggedIn(
        session,
        API,
        { ...auth, login: { ...auth.login, method: 'get' } },
        BASE_URL
      )

      // The transport options the call also carries -- timeout, redirects --
      // are the subject of their own tests
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'get',
          url: `${BASE_URL}login`,
          data: { username: 'demo', password: 's3cret-pw', loginType: 'user' },
        })
      )
      expect(session.cookies.get('sessionid')).toBe('abc')
      expect(session.generation).toBe(1)
    })
  })
})
