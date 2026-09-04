import { AxiosRequestConfig } from 'axios'
import { constructAuthHeader, recordAuthResponse } from '../authHeaders'
import { ApiAuthentication } from '../types'
import { resetCookieJars } from '../cookieJar'

const API = 'PeerConforma'

// A peer Conforma takes its credential as "refresh" and mints "access" from it,
// but nothing here is Conforma-specific -- both names are configuration
const CREDENTIAL_COOKIE = 'refresh'
const MINTED_COOKIE = 'access'

const authHeaderFor = (
  authentication: ApiAuthentication,
  axiosRequest: AxiosRequestConfig = {},
  apiName = API
) => {
  constructAuthHeader(authentication, axiosRequest, apiName)
  return axiosRequest
}

// What the peer sends back when it mints an access token for us
const peerMinted = (token: string) => [
  `${MINTED_COOKIE}=${token}; Max-Age=34560000; Path=/; HttpOnly; Secure; SameSite=Strict`,
]

describe('constructAuthHeader', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, API_SECRET: 'from-the-environment', API_USER: 'env-user' }
    resetCookieJars()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('Basic', () => {
    it('sets axios auth from literal credentials', () => {
      const request = authHeaderFor({ type: 'Basic', username: 'conforma', password: 'hunter2' })

      expect(request.auth).toEqual({ username: 'conforma', password: 'hunter2' })
    })

    // "env." substitution used to be applied to the password only, so a
    // username written as "env.API_USER" was sent literally
    it('substitutes env variables into BOTH username and password', () => {
      const request = authHeaderFor({
        type: 'Basic',
        username: 'env.API_USER',
        password: 'env.API_SECRET',
      })

      expect(request.auth).toEqual({ username: 'env-user', password: 'from-the-environment' })
    })

    // Better than authenticating with the reference itself and reading the
    // rejection back from the external server
    it('refuses an env reference whose variable is unset', () => {
      expect(() =>
        authHeaderFor({
          type: 'Basic',
          username: 'conforma',
          password: 'env.NOT_SET',
        })
      ).toThrow('Environment variable not set: NOT_SET')
    })
  })

  describe('Bearer', () => {
    it('sets an Authorization header, with env substitution', () => {
      const request = authHeaderFor({ type: 'Bearer', token: 'env.API_SECRET' })

      expect(request.headers).toEqual({ Authorization: 'Bearer from-the-environment' })
    })

    // The Bearer branch used to assign `headers` outright
    it('keeps headers supplied by additionalAxiosProperties', () => {
      const request = authHeaderFor(
        { type: 'Bearer', token: 'abc' },
        { headers: { 'X-Requested-By': 'Conforma' } }
      )

      expect(request.headers).toEqual({
        'X-Requested-By': 'Conforma',
        Authorization: 'Bearer abc',
      })
    })
  })

  describe('CookieToken', () => {
    // The far Conforma server treats a *missing* access token exactly as an
    // expired one, so presenting only the refresh cookie is enough for it to
    // mint an access token and serve the request
    it('sends the provisioned token as the refresh cookie', () => {
      const request = authHeaderFor({
        type: 'CookieToken',
        cookieName: CREDENTIAL_COOKIE,
        token: 'a-provisioned-token',
      })

      expect(request.headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token`,
      })
    })

    it('substitutes env variables into the token', () => {
      const request = authHeaderFor({
        type: 'CookieToken',
        cookieName: CREDENTIAL_COOKIE,
        token: 'env.API_SECRET',
      })

      expect(request.headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=from-the-environment`,
      })
    })

    // Matches the far server's cookie reader, which decodeURIComponents values
    it('url-encodes the token', () => {
      const request = authHeaderFor({
        type: 'CookieToken',
        cookieName: CREDENTIAL_COOKIE,
        token: 'has spaces; and=signs',
      })

      expect(request.headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=has%20spaces%3B%20and%3Dsigns`,
      })
    })

    it('keeps headers supplied by additionalAxiosProperties', () => {
      const request = authHeaderFor(
        { type: 'CookieToken', cookieName: CREDENTIAL_COOKIE, token: 'abc' },
        { headers: { 'X-Requested-By': 'Conforma' } }
      )

      expect(request.headers).toEqual({
        'X-Requested-By': 'Conforma',
        Cookie: `${CREDENTIAL_COOKIE}=abc`,
      })
    })
  })

  /*
  The peer mints an access token for the provisioned credential and returns it
  as a cookie; we send it back, so it only mints again once that token expires
  -- kdd/auth-token-lifecycle §7
  */
  describe('CookieToken: carrying what the server sets', () => {
    const auth: ApiAuthentication = {
      type: 'CookieToken',
      cookieName: CREDENTIAL_COOKIE,
      token: 'a-provisioned-token',
    }

    it('presents the access token the peer last minted, alongside the credential', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token; ${MINTED_COOKIE}=minted-jwt`,
      })
    })

    it('carries the replacement when the peer mints a fresher one', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('first-jwt') }, API)
      recordAuthResponse(auth, { 'set-cookie': peerMinted('second-jwt') }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token; ${MINTED_COOKIE}=second-jwt`,
      })
    })

    // Silence means the token we sent was still good, so there is nothing to replace
    it('keeps the token it holds when a response sets no cookie', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)
      recordAuthResponse(auth, {}, API)
      recordAuthResponse(auth, undefined, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token; ${MINTED_COOKIE}=minted-jwt`,
      })
    })

    // A revoked session is reported by expiring the cookie -- Max-Age=0, empty value
    it('drops the token when the peer expires it', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)
      recordAuthResponse(auth, { 'set-cookie': [`${MINTED_COOKIE}=; Max-Age=0; Path=/`] }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token`,
      })
    })

    // Editing the credential in preferences must not send the old credential's
    // token under the new one -- which is what keeps prefs reload out of this
    it('discards a token minted for a credential that is no longer configured', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)

      const rotated: ApiAuthentication = {
        type: 'CookieToken',
        cookieName: CREDENTIAL_COOKIE,
        token: 'a-rotated-token',
      }
      expect(authHeaderFor(rotated).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-rotated-token`,
      })
    })

    it("keeps each API's token to itself", () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)

      expect(authHeaderFor(auth, {}, 'AnotherPeer').headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token`,
      })
    })

    // The jar is a browser's, not a Conforma one: it has no opinion about what
    // the server chose to name its session cookie
    it('carries any cookie the server sets, not only the one it minted', () => {
      recordAuthResponse(auth, { 'set-cookie': ['session=abc; Path=/', 'csrf=xyz'] }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token; session=abc; csrf=xyz`,
      })
    })

    // The credential comes from configuration and is ours to send, so a server
    // echoing that name back must not become a second value for it
    it("never sends a second value for the credential's own cookie", () => {
      recordAuthResponse(auth, { 'set-cookie': [`${CREDENTIAL_COOKIE}=rotated; Path=/`] }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token`,
      })
    })

    it('records nothing for the other auth types', () => {
      const bearer: ApiAuthentication = { type: 'Bearer', token: 'a-provisioned-token' }
      recordAuthResponse(bearer, { 'set-cookie': peerMinted('minted-jwt') }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${CREDENTIAL_COOKIE}=a-provisioned-token`,
      })
    })
  })

  it('throws on an unrecognised auth type', () => {
    expect(() => authHeaderFor({ type: 'OAuth2' } as unknown as ApiAuthentication)).toThrow(
      'Invalid authorisation config'
    )
  })
})
