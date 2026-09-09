/*
Holds the cookies a server sets on us, per external API, so we send them back on
the next request the way a browser would.

That is what makes the cookie-based auth types work. For "CookieToken" against
a peer Conforma (kdd/auth-token-lifecycle §7) the cookie in question is the
access token it mints from our provisioned credential: carrying it means it
mints once per token lifetime instead of once per request. For "CookieLogin"
the cookies ARE the session: the jar is the whole cache, and login.ts fills it.

Held per API, not per caller. The credential is the API's, so every relay
request to it authenticates as the same identity whoever triggered it, and they
can all share what the server sent back.

Invalidation is by construction rather than by a hook. Each session records a
fingerprint of the credential it was filled under, so editing the credential in
preferences orphans the old session instead of sending another server's cookies
with a new credential. That is what keeps prefs reload out of this. The login
backoff lives on the same record, so correcting a bad credential clears that
for free.

The fingerprint is a hash of the credential, never the credential itself
(authHeaders.ts): nothing here is recoverable from a heap dump, and nothing a
debug log might print is a secret.

Nothing here needs to notice expiry, and deliberately so: a cookie we have held
too long is simply not accepted, and a server that wants to replace it says so
in its response. So there is no clock and no reason to inspect what we hold.
*/

export type ApiSession = {
  // sha256 of the credential this was filled under
  fingerprint: string
  cookies: Map<string, string>
  // Bumped by a successful login and by nothing else, so a value read before
  // a request went out says whether a login has completed since. Not by
  // recordCookies, even when the server rotates a cookie: a server that
  // expires the cookie on the very response that rejects it would otherwise
  // read as a completed repair, and the rejection would be passed on to our
  // client instead of logging in.
  generation: number
  // Present while a login is in flight; awaiting it is the queue (login.ts)
  loginPromise?: Promise<void>
  // Epoch ms before which no login may start
  failedUntil?: number
}

const sessions = new Map<string, ApiSession>()

// The session is only ours if it was filled under the credential still
// configured. Any other is orphaned here and an empty one takes its place.
export const getSession = (apiName: string, fingerprint: string): ApiSession => {
  const session = sessions.get(apiName)
  if (session?.fingerprint === fingerprint) return session

  const fresh: ApiSession = { fingerprint, cookies: new Map(), generation: 0 }
  sessions.set(apiName, fresh)
  return fresh
}

// "name=value" pairs, ready to join into a Cookie header
export const storedCookies = (session: ApiSession) =>
  Array.from(session.cookies, ([name, value]) => `${name}=${value}`)

// Set-Cookie values look like "access=eyJ...; Max-Age=0; Path=/; HttpOnly", so
// everything after the first attribute is the server's storage instructions to
// a browser, not part of the value
const parseSetCookie = (header: string) => {
  const [pair] = header.split(';')
  const separator = pair.indexOf('=')
  if (separator === -1) return undefined

  return { name: pair.slice(0, separator).trim(), value: pair.slice(separator + 1).trim() }
}

/*
Harvests a response's Set-Cookie headers into the session. Returns how many
cookies it stored, so a login can tell a response that gave it nothing to hold.

`credentialCookieName` is the cookie CookieToken presents from configuration;
CookieLogin has no such cookie, so nothing is skipped on harvest.
*/
export const recordCookies = (
  session: ApiSession,
  setCookieHeaders: string[] | undefined,
  credentialCookieName?: string
) => {
  let stored = 0

  for (const header of setCookieHeaders ?? []) {
    const cookie = parseSetCookie(header)
    if (!cookie) continue

    // The credential is ours to send, from configuration, so a server echoing
    // that name back must not end up as a second value for it in the header
    if (cookie.name === credentialCookieName) continue

    // An empty value is the server expiring the cookie, which is how it says
    // the thing behind it is gone. Keeping it would mean presenting something
    // we have been told is dead.
    if (cookie.value) {
      session.cookies.set(cookie.name, cookie.value)
      stored += 1
    } else session.cookies.delete(cookie.name)
  }

  return stored
}

// Only for tests -- the sessions are process-lifetime state otherwise. Login
// state (the in-flight promise, the backoff) lives on the same records, so
// this clears that too.
export const resetCookieJars = () => sessions.clear()
