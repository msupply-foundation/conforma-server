import { AxiosRequestConfig } from 'axios'
import { ApiAuthentication } from './types'
import { getEnvVariableReplacement } from '../utilityFunctions'
import { getStoredCookies, recordCookies } from './cookieJar'

// Merges rather than assigns, so auth doesn't wipe out any headers the route
// supplied through "additionalAxiosProperties"
const setHeader = (axiosRequest: AxiosRequestConfig, name: string, value: string) => {
  axiosRequest.headers = { ...axiosRequest.headers, [name]: value }
}

// Adds appropriate auth properties to Axios request object (modifies in-place)
const constructAuthHeader = (
  authentication: ApiAuthentication,
  axiosRequest: AxiosRequestConfig,
  apiName: string
) => {
  switch (authentication.type) {
    case 'Basic': {
      const { username, password } = authentication
      axiosRequest.auth = {
        username: getEnvVariableReplacement(username),
        password: getEnvVariableReplacement(password),
      }
      break
    }

    case 'Bearer': {
      const token = getEnvVariableReplacement(authentication.token)
      setHeader(axiosRequest, 'Authorization', `Bearer ${token}`)
      break
    }

    // A server that takes its credential in a cookie, behaving as a browser
    // does: present the credential, and whatever the server has set on us since
    // (see types.ts).
    //
    // For a peer Conforma the stored cookie is the access token it minted from
    // our credential, and sending both is what lets the server choose: it
    // prefers the access token and falls back to the credential only when that
    // one is missing or expired. The fallback happens within the request, so
    // there is nothing to retry and no expiry for us to track.
    case 'CookieToken': {
      const token = getEnvVariableReplacement(authentication.token)
      const { cookieName } = authentication

      // Encoded because a cookie value is read back decoded -- Conforma's own
      // reader does, and RFC 6265 has no other escaping for ";" or ","
      const cookies = [
        `${cookieName}=${encodeURIComponent(token)}`,
        ...getStoredCookies(apiName, token),
      ]

      setHeader(axiosRequest, 'Cookie', cookies.join('; '))
      break
    }

    default:
      throw new Error('Invalid authorisation config')
  }
}

/*
Picks up cookies the server set on this request, so the next one can present
them. Called for every response, including error responses: a server that has
ended our session says so by expiring the cookie, and that is exactly when we
most want to stop sending it.

A no-op for the other auth types, whose credentials no server replaces.
*/
const recordAuthResponse = (
  authentication: ApiAuthentication,
  responseHeaders: { 'set-cookie'?: string[] } | undefined,
  apiName: string
) => {
  if (authentication?.type !== 'CookieToken') return

  recordCookies(
    apiName,
    getEnvVariableReplacement(authentication.token),
    authentication.cookieName,
    responseHeaders?.['set-cookie']
  )
}

export { constructAuthHeader, recordAuthResponse }
