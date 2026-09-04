import { AxiosRequestConfig } from 'axios'
import { ApiAuthentication } from './types'
import { getEnvVariableReplacement } from '../utilityFunctions'
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from '../permissions/sessionCookies'
import { getStoredAccessToken, recordAccessToken } from './conformaSession'

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

    // A peer Conforma server, behaving as a browser does: present the access
    // token it last minted for us, and the provisioned credential it can mint
    // a replacement from when that one has aged out (see types.ts).
    //
    // Both go on every request, because the peer decides between them: it
    // prefers the access token and only falls back to the refresh token when
    // the access one is missing or expired. That fallback happens within the
    // request, so there is nothing to retry and no expiry for us to track.
    case 'ConformaSession': {
      const token = getEnvVariableReplacement(authentication.token)
      const accessToken = getStoredAccessToken(apiName, token)

      // Encoded to match the far server's cookie reader, which decodes
      const cookies = [`${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`]
      if (accessToken) cookies.push(`${ACCESS_COOKIE_NAME}=${encodeURIComponent(accessToken)}`)

      setHeader(axiosRequest, 'Cookie', cookies.join('; '))
      break
    }

    default:
      throw new Error('Invalid authorisation config')
  }
}

/*
Picks up an access token the peer minted for this request, so the next one can
present it instead of having another minted. Called for every response,
including error responses: a peer whose session has been revoked expires the
cookie, and that is exactly when we most want to stop sending it.

A no-op for the other auth types, whose credentials the peer never replaces.
*/
const recordAuthResponse = (
  authentication: ApiAuthentication,
  responseHeaders: { 'set-cookie'?: string[] } | undefined,
  apiName: string
) => {
  if (authentication?.type !== 'ConformaSession') return

  recordAccessToken(
    apiName,
    getEnvVariableReplacement(authentication.token),
    responseHeaders?.['set-cookie']
  )
}

export { constructAuthHeader, recordAuthResponse }
