import { AxiosRequestConfig } from 'axios'
import { ApiAuthentication } from './types'
import { getEnvVariableReplacement } from '../utilityFunctions'
import { REFRESH_COOKIE_NAME } from '../permissions/sessionCookies'

// Merges rather than assigns, so auth doesn't wipe out any headers the route
// supplied through "additionalAxiosProperties"
const setHeader = (axiosRequest: AxiosRequestConfig, name: string, value: string) => {
  axiosRequest.headers = { ...axiosRequest.headers, [name]: value }
}

// Adds appropriate auth properties to Axios request object (modifies in-place)
const constructAuthHeader = (
  authentication: ApiAuthentication,
  axiosRequest: AxiosRequestConfig
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

    // A peer Conforma server: send the provisioned session credential as the
    // refresh cookie and let the far end mint an access token for it, exactly
    // as it does for a browser whose access cookie has aged out (see types.ts).
    //
    // Nothing is kept between requests. A client that stored the returned
    // access cookie would save the far server a signature per request, but it
    // would also make the relay stateful -- a cache to invalidate whenever
    // preferences reload, for a credential that never expires on our side. The
    // far server explicitly supports a client that ignores Set-Cookie
    // (kdd/auth-token-lifecycle §4): it mints per request, with an indexed
    // lookup and no bcrypt.
    case 'ConformaSession': {
      const token = getEnvVariableReplacement(authentication.token)
      // Encoded to match the far server's cookie reader, which decodes
      setHeader(axiosRequest, 'Cookie', `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`)
      break
    }

    default:
      throw new Error('Invalid authorisation config')
  }
}

export { constructAuthHeader }
