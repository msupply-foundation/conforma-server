/*
Holds the cookies a server sets on us, per external API, so we send them back on
the next request the way a browser would.

That is what makes the "CookieToken" auth type work against a server that hands
out a session on first use rather than expecting the same credential every time.
For a peer Conforma (kdd/auth-token-lifecycle §7) the cookie in question is the
access token it mints from our provisioned credential: carrying it means it
mints once per token lifetime instead of once per request.

Held per API, not per caller. The credential is the API's, so every relay
request to it authenticates as the same identity whoever triggered it, and they
can all share what the server sent back.

Invalidation is by construction rather than by a hook. Each jar records the
token it was filled under, so editing the credential in preferences orphans the
old jar instead of sending another server's cookies with a new credential. That
is what keeps prefs reload out of this.

Nothing here needs to notice expiry, and deliberately so: a cookie we have held
too long is simply not accepted, and a server that wants to replace it says so
in its response. So there is no clock and no reason to inspect what we hold.
*/

type Jar = { token: string; cookies: Map<string, string> }

const jars = new Map<string, Jar>()

// The jar is only ours if it was filled under the credential still configured
const getJar = (apiName: string, token: string) => {
  const jar = jars.get(apiName)
  return jar?.token === token ? jar : undefined
}

// "name=value" pairs, ready to join into a Cookie header
export const getStoredCookies = (apiName: string, token: string) =>
  Array.from(getJar(apiName, token)?.cookies ?? [], ([name, value]) => `${name}=${value}`)

// Set-Cookie values look like "access=eyJ...; Max-Age=0; Path=/; HttpOnly", so
// everything after the first attribute is the server's storage instructions to
// a browser, not part of the value
const parseSetCookie = (header: string) => {
  const [pair] = header.split(';')
  const separator = pair.indexOf('=')
  if (separator === -1) return undefined

  return { name: pair.slice(0, separator).trim(), value: pair.slice(separator + 1).trim() }
}

export const recordCookies = (
  apiName: string,
  token: string,
  credentialCookieName: string,
  setCookieHeaders: string[] | undefined
) => {
  if (!setCookieHeaders?.length) return

  const jar = getJar(apiName, token) ?? { token, cookies: new Map<string, string>() }

  for (const header of setCookieHeaders) {
    const cookie = parseSetCookie(header)
    if (!cookie) continue

    // The credential is ours to send, from configuration, so a server echoing
    // that name back must not end up as a second value for it in the header
    if (cookie.name === credentialCookieName) continue

    // An empty value is the server expiring the cookie, which is how it says
    // the thing behind it is gone. Keeping it would mean presenting something
    // we have been told is dead.
    if (cookie.value) jar.cookies.set(cookie.name, cookie.value)
    else jar.cookies.delete(cookie.name)
  }

  jars.set(apiName, jar)
}

// Only for tests -- the jars are process-lifetime state otherwise
export const resetCookieJars = () => jars.clear()
