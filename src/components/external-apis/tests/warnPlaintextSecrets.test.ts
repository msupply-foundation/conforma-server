import { warnAboutPlaintextSecrets } from '../warnPlaintextSecrets'
import { ExternalApiConfigs } from '../types'

const apiWith = (authentication: any): ExternalApiConfigs => ({
  MedServer: { baseUrl: 'https://example.org', authentication, routes: {} },
})

const cookieLoginWith = (body: { [key: string]: string }) =>
  apiWith({ type: 'CookieLogin', login: { url: 'login', body } })

describe('warnAboutPlaintextSecrets', () => {
  let logged: string[]

  beforeEach(() => {
    logged = []
    jest.spyOn(console, 'log').mockImplementation((...args) => logged.push(args.join(' ')))
  })

  afterEach(() => jest.restoreAllMocks())

  const output = () => logged.join('\n')

  it('warns about a literal Basic password', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'Basic', username: 'conforma', password: 'hunter2' }))

    expect(output()).toContain('MedServer ("password")')
  })

  it('warns about a literal Bearer token', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'Bearer', token: 'abc123' }))

    expect(output()).toContain('MedServer ("token")')
  })

  it('warns about a literal CookieToken token', () => {
    warnAboutPlaintextSecrets(
      apiWith({ type: 'CookieToken', cookieName: 'refresh', token: 'abc123' })
    )

    expect(output()).toContain('MedServer ("token")')
  })

  it('says nothing when the secret defers to an env variable', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'Basic', username: 'c', password: 'env.MED_PW' }))

    expect(output()).toBe('')
  })

  // A username is substitutable but not secret, so it isn't worth a warning
  it('ignores a literal Basic username', () => {
    warnAboutPlaintextSecrets(
      apiWith({ type: 'Basic', username: 'conforma', password: 'env.MED_PW' })
    )

    expect(output()).toBe('')
  })

  it('names every offending API', () => {
    warnAboutPlaintextSecrets({
      ...apiWith({ type: 'Bearer', token: 'abc' }),
      PeerConforma: {
        baseUrl: 'https://peer.example.org',
        authentication: { type: 'CookieToken', cookieName: 'refresh', token: 'xyz' },
        routes: {},
      },
    })

    expect(output()).toContain('MedServer ("token"), PeerConforma ("token")')
  })

  it('says nothing when no external APIs are configured', () => {
    warnAboutPlaintextSecrets(undefined)

    expect(output()).toBe('')
  })

  // Absent or malformed auth is a different problem, reported by the request
  it('says nothing about an unrecognised auth type', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'OAuth2', clientSecret: 'abc' }))
    warnAboutPlaintextSecrets(apiWith(undefined))

    expect(output()).toBe('')
  })

  /*
  CookieLogin's secret sits under a key of the config author's choosing, next to
  fields that are not secret at all -- so only keys that look like a credential
  are checked, and a correct mSupply config produces no warning
  */
  describe('CookieLogin', () => {
    it('flags a literal password in the login body, by its path', () => {
      warnAboutPlaintextSecrets(
        cookieLoginWith({ username: 'demo', password: 'hunter2', loginType: 'user' })
      )

      expect(output()).toContain('MedServer ("login.body.password")')
    })

    it('stays silent for an env reference', () => {
      warnAboutPlaintextSecrets(
        cookieLoginWith({ username: 'demo', password: 'env.MSUPPLY_PW', loginType: 'user' })
      )

      expect(output()).toBe('')
    })

    // Warning on these would cry wolf on the real mSupply config
    it('stays silent for username and loginType', () => {
      warnAboutPlaintextSecrets(cookieLoginWith({ username: 'demo', loginType: 'user' }))

      expect(output()).toBe('')
    })

    it.each(['apiKey', 'clientSecret', 'authToken', 'PASSWORD'])(
      'recognises a credential-shaped key such as %s',
      (key) => {
        warnAboutPlaintextSecrets(cookieLoginWith({ [key]: 'literal' }))

        expect(output()).toContain(`MedServer ("login.body.${key}")`)
      }
    )

    it('names each literal secret when there are several', () => {
      warnAboutPlaintextSecrets(cookieLoginWith({ password: 'a', apiKey: 'b' }))

      expect(output()).toContain(
        'MedServer ("login.body.password"), MedServer ("login.body.apiKey")'
      )
    })

    // The key is the config author's, so it may hold anything. Reading the
    // value back from a path built out of it would find nothing here.
    it.each(['api.password', 'auth[0]', 'x.y.token'])(
      'warns about a literal under the key "%s"',
      (key) => {
        warnAboutPlaintextSecrets(cookieLoginWith({ [key]: 'hunter2' }))

        expect(output()).toContain(`MedServer ("login.body.${key}")`)
      }
    )

    it('says nothing for a login with no body', () => {
      warnAboutPlaintextSecrets(apiWith({ type: 'CookieLogin', login: { url: 'login' } }))

      expect(output()).toBe('')
    })
  })
})
