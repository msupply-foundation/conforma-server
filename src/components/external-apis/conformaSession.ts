import { ACCESS_COOKIE_NAME } from '../permissions/sessionCookies'

/*
Holds the access token a peer Conforma server mints for us, so we can present
it again rather than have one minted per request -- kdd/auth-token-lifecycle §7,
"we simply send back whatever the far server sets".

Held per API, not per caller. The credential belongs to the service account the
peer provisioned for us, so every relay request to that API authenticates as
the same user whoever triggered it, and they can all share one token.

Invalidation is by construction rather than by a hook. Each entry records the
refresh token it was minted against, so editing the credential in preferences
orphans the old entry instead of leaving a stale access token to be sent
alongside a new credential. That is what keeps prefs reload out of this.

Nothing here needs to notice expiry, and deliberately so: an access token we
have held past its "exp" is simply unusable to the peer, which falls back to
the refresh token we send alongside it and mints a replacement -- within the
same request. So there is no retry, no clock, and no reason to inspect the
token we are holding.
*/

type StoredSession = { refreshToken: string; accessToken: string }

const sessions = new Map<string, StoredSession>()

export const getStoredAccessToken = (apiName: string, refreshToken: string) => {
  const stored = sessions.get(apiName)

  // A different credential is configured now, so anything minted for the old
  // one is no longer ours to send
  return stored?.refreshToken === refreshToken ? stored.accessToken : undefined
}

// Set-Cookie values look like "access=eyJ...; Max-Age=...; Path=/; HttpOnly".
// Returns undefined when the peer didn't mention the cookie at all, which is
// different from clearing it.
const readSetCookie = (setCookieHeaders: string[], name: string) => {
  for (const header of setCookieHeaders) {
    const [pair] = header.split(';')
    const separator = pair.indexOf('=')
    if (separator === -1) continue
    if (pair.slice(0, separator).trim() !== name) continue
    return decodeURIComponent(pair.slice(separator + 1).trim())
  }

  return undefined
}

export const recordAccessToken = (
  apiName: string,
  refreshToken: string,
  setCookieHeaders: string[] | undefined
) => {
  const accessToken = readSetCookie(setCookieHeaders ?? [], ACCESS_COOKIE_NAME)

  // Silence means the token we sent was still good -- keep it
  if (accessToken === undefined) return

  // An empty value is the peer expiring the cookie, which it does when the
  // session behind it is gone. Holding on to the token would just mean sending
  // a credential we have been told is dead.
  if (!accessToken) sessions.delete(apiName)
  else sessions.set(apiName, { refreshToken, accessToken })
}

// Only for tests -- the store is process-lifetime state otherwise
export const resetStoredSessions = () => sessions.clear()
