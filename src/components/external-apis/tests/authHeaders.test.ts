import { AxiosRequestConfig } from 'axios'
import { constructAuthHeader, recordAuthResponse } from '../authHeaders'
import { ApiAuthentication } from '../types'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../../permissions/sessionCookies'
import { resetStoredSessions } from '../conformaSession'

const API = 'PeerConforma'

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
  `${ACCESS_COOKIE_NAME}=${token}; Max-Age=34560000; Path=/; HttpOnly; Secure; SameSite=Strict`,
]

describe('constructAuthHeader', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, API_SECRET: 'from-the-environment', API_USER: 'env-user' }
    resetStoredSessions()
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

    it('leaves an env reference alone when the variable is unset', () => {
      const request = authHeaderFor({
        type: 'Basic',
        username: 'conforma',
        password: 'env.NOT_SET',
      })

      expect(request.auth).toEqual({ username: 'conforma', password: 'env.NOT_SET' })
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

  describe('ConformaSession', () => {
    // The far Conforma server treats a *missing* access token exactly as an
    // expired one, so presenting only the refresh cookie is enough for it to
    // mint an access token and serve the request
    it('sends the provisioned token as the refresh cookie', () => {
      const request = authHeaderFor({ type: 'ConformaSession', token: 'a-provisioned-token' })

      expect(request.headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token`,
      })
    })

    it('substitutes env variables into the token', () => {
      const request = authHeaderFor({ type: 'ConformaSession', token: 'env.API_SECRET' })

      expect(request.headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=from-the-environment`,
      })
    })

    // Matches the far server's cookie reader, which decodeURIComponents values
    it('url-encodes the token', () => {
      const request = authHeaderFor({ type: 'ConformaSession', token: 'has spaces; and=signs' })

      expect(request.headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=has%20spaces%3B%20and%3Dsigns`,
      })
    })

    it('keeps headers supplied by additionalAxiosProperties', () => {
      const request = authHeaderFor(
        { type: 'ConformaSession', token: 'abc' },
        { headers: { 'X-Requested-By': 'Conforma' } }
      )

      expect(request.headers).toEqual({
        'X-Requested-By': 'Conforma',
        Cookie: `${REFRESH_COOKIE_NAME}=abc`,
      })
    })
  })

  /*
  The peer mints an access token for the provisioned credential and returns it
  as a cookie; we send it back, so it only mints again once that token expires
  -- kdd/auth-token-lifecycle §7
  */
  describe("ConformaSession: carrying the peer's access token", () => {
    const auth: ApiAuthentication = { type: 'ConformaSession', token: 'a-provisioned-token' }

    it('presents the access token the peer last minted, alongside the credential', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token; ${ACCESS_COOKIE_NAME}=minted-jwt`,
      })
    })

    it('carries the replacement when the peer mints a fresher one', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('first-jwt') }, API)
      recordAuthResponse(auth, { 'set-cookie': peerMinted('second-jwt') }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token; ${ACCESS_COOKIE_NAME}=second-jwt`,
      })
    })

    // Silence means the token we sent was still good, so there is nothing to replace
    it('keeps the token it holds when a response sets no cookie', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)
      recordAuthResponse(auth, {}, API)
      recordAuthResponse(auth, undefined, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token; ${ACCESS_COOKIE_NAME}=minted-jwt`,
      })
    })

    // A revoked session is reported by expiring the cookie -- Max-Age=0, empty value
    it('drops the token when the peer expires it', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)
      recordAuthResponse(auth, { 'set-cookie': [`${ACCESS_COOKIE_NAME}=; Max-Age=0; Path=/`] }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token`,
      })
    })

    // Editing the credential in preferences must not send the old credential's
    // token under the new one -- which is what keeps prefs reload out of this
    it('discards a token minted for a credential that is no longer configured', () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)

      const rotated: ApiAuthentication = { type: 'ConformaSession', token: 'a-rotated-token' }
      expect(authHeaderFor(rotated).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-rotated-token`,
      })
    })

    it("keeps each API's token to itself", () => {
      recordAuthResponse(auth, { 'set-cookie': peerMinted('minted-jwt') }, API)

      expect(authHeaderFor(auth, {}, 'AnotherPeer').headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token`,
      })
    })

    it("ignores the peer's other cookies", () => {
      recordAuthResponse(
        auth,
        { 'set-cookie': [`${REFRESH_COOKIE_NAME}=rotated; Path=/`, 'unrelated=value'] },
        API
      )

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token`,
      })
    })

    it('records nothing for the other auth types', () => {
      const bearer: ApiAuthentication = { type: 'Bearer', token: 'a-provisioned-token' }
      recordAuthResponse(bearer, { 'set-cookie': peerMinted('minted-jwt') }, API)

      expect(authHeaderFor(auth).headers).toEqual({
        Cookie: `${REFRESH_COOKIE_NAME}=a-provisioned-token`,
      })
    })
  })

  it('throws on an unrecognised auth type', () => {
    expect(() => authHeaderFor({ type: 'OAuth2' } as unknown as ApiAuthentication)).toThrow(
      'Invalid authorisation config'
    )
  })
})
