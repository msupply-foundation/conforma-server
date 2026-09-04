import { AxiosRequestConfig } from 'axios'
import { constructAuthHeader } from '../authHeaders'
import { ApiAuthentication } from '../types'
import { REFRESH_COOKIE_NAME } from '../../permissions/sessionCookies'

const authHeaderFor = (
  authentication: ApiAuthentication,
  axiosRequest: AxiosRequestConfig = {}
) => {
  constructAuthHeader(authentication, axiosRequest)
  return axiosRequest
}

describe('constructAuthHeader', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, API_SECRET: 'from-the-environment', API_USER: 'env-user' }
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

    it('does not carry any state between requests', () => {
      const first = authHeaderFor({ type: 'ConformaSession', token: 'abc' })
      const second = authHeaderFor({ type: 'ConformaSession', token: 'abc' })

      expect(second.headers).toEqual(first.headers)
    })
  })

  it('throws on an unrecognised auth type', () => {
    expect(() => authHeaderFor({ type: 'OAuth2' } as unknown as ApiAuthentication)).toThrow(
      'Invalid authorisation config'
    )
  })
})
