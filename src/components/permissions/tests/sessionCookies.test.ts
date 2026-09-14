import { FastifyReply, FastifyRequest } from 'fastify'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAccessCookie,
  setRefreshCookie,
} from '../sessionCookies'

const requestWithCookie = (cookie?: string) =>
  ({ headers: cookie ? { cookie } : {} }) as FastifyRequest

/*
Models Fastify's real reply-header behaviour, which is what the code under test
has to work around: repeated Set-Cookie values are APPENDED into an array rather
than replacing each other (see fastify/lib/reply.js).
*/
const fakeReply = () => {
  const headers: Record<string, string | string[]> = {}

  const reply = {
    header: (key: string, value: string) => {
      const name = key.toLowerCase()
      if (name === 'set-cookie' && headers[name] !== undefined) {
        const current = headers[name]
        headers[name] = Array.isArray(current) ? [...current, value] : [current, value]
      } else headers[name] = value
      return reply
    },
    getHeader: (key: string) => headers[key.toLowerCase()],
    removeHeader: (key: string) => {
      delete headers[key.toLowerCase()]
      return reply
    },
  }

  const cookies = (): string[] => {
    const value = headers['set-cookie']
    if (value === undefined) return []
    return Array.isArray(value) ? value : [value]
  }

  const cookieNamed = (name: string) => cookies().filter((c) => c.startsWith(`${name}=`))

  return { reply: reply as unknown as FastifyReply, cookies, cookieNamed }
}

// -- reading cookies --

test('Reads each token when it is the only cookie', () => {
  expect(getRefreshToken(requestWithCookie(`${REFRESH_COOKIE_NAME}=abc123`))).toBe('abc123')
  expect(getAccessToken(requestWithCookie(`${ACCESS_COOKIE_NAME}=jwt.abc`))).toBe('jwt.abc')
})

test('Tells the two cookies apart when both are present', () => {
  const request = requestWithCookie(`${ACCESS_COOKIE_NAME}=jwt.abc; ${REFRESH_COOKIE_NAME}=abc123`)

  expect(getAccessToken(request)).toBe('jwt.abc')
  expect(getRefreshToken(request)).toBe('abc123')
})

test('Reads a token from among unrelated cookies', () => {
  const cookie = `theme=dark; ${REFRESH_COOKIE_NAME}=abc123; locale=en`
  expect(getRefreshToken(requestWithCookie(cookie))).toBe('abc123')
})

test('Tolerates missing and extra whitespace between cookies', () => {
  expect(getRefreshToken(requestWithCookie(`a=1;${REFRESH_COOKIE_NAME}=abc123;b=2`))).toBe('abc123')
  expect(getRefreshToken(requestWithCookie(`a=1;    ${REFRESH_COOKIE_NAME}=abc123`))).toBe('abc123')
})

test('Returns null when there is no Cookie header at all', () => {
  expect(getRefreshToken(requestWithCookie())).toBeNull()
  expect(getAccessToken(requestWithCookie())).toBeNull()
})

test('Returns null when cookies are present but none is the one asked for', () => {
  expect(getRefreshToken(requestWithCookie('theme=dark; locale=en'))).toBeNull()
})

// A substring match here would hand back the wrong value, and these are
// plausible names for a cookie to sit next to ours.
test('Only matches the cookie name exactly', () => {
  expect(getRefreshToken(requestWithCookie(`x${REFRESH_COOKIE_NAME}=wrong`))).toBeNull()
  expect(getRefreshToken(requestWithCookie(`${REFRESH_COOKIE_NAME}_token=wrong`))).toBeNull()
  expect(getRefreshToken(requestWithCookie(`other=${REFRESH_COOKIE_NAME}=wrong`))).toBeNull()
})

test('Ignores malformed segments with no "="', () => {
  expect(getRefreshToken(requestWithCookie(`nonsense; ${REFRESH_COOKIE_NAME}=abc123`))).toBe(
    'abc123'
  )
})

test('An empty cookie value reads back as an empty string, not null', () => {
  expect(getRefreshToken(requestWithCookie(`${REFRESH_COOKIE_NAME}=`))).toBe('')
})

test('Decodes an encoded value, and keeps "=" inside the value intact', () => {
  expect(getRefreshToken(requestWithCookie(`${REFRESH_COOKIE_NAME}=a%2Bb%2Fc%3D`))).toBe('a+b/c=')
  expect(getRefreshToken(requestWithCookie(`${REFRESH_COOKIE_NAME}=abc==`))).toBe('abc==')
})

// -- setting cookies --

test('Sets each token as its own Set-Cookie header', () => {
  const { reply, cookies } = fakeReply()
  setRefreshCookie(reply, 'abc123')
  setAccessCookie(reply, 'jwt.abc')

  expect(cookies()).toHaveLength(2)
  expect(cookies()[0]).toMatch(new RegExp(`^${REFRESH_COOKIE_NAME}=abc123;`))
  expect(cookies()[1]).toMatch(new RegExp(`^${ACCESS_COOKIE_NAME}=jwt.abc;`))
})

// These flags are the whole security story of the transport: HttpOnly keeps the
// token out of JavaScript, and SameSite=Strict is what covers CSRF once every
// request is cookie-authenticated (Lax would not, since GraphQL answers GETs).
test('Sets the cookie flags that make the transport safe', () => {
  const { reply, cookies } = fakeReply()
  setRefreshCookie(reply, 'abc123')

  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/'])
    expect(cookies()[0]).toContain(flag)
  expect(cookies()[0]).toMatch(/Max-Age=\d+/)
})

test('Encodes a token containing cookie-delimiter characters', () => {
  const { reply, cookies } = fakeReply()
  setRefreshCookie(reply, 'a+b/c=;d')

  expect(cookies()[0]).toMatch(new RegExp(`^${REFRESH_COOKIE_NAME}=a%2Bb%2Fc%3D%3Bd;`))
})

/*
This happens on a real request: the middleware mints an access token so the
route can authenticate, and the route then issues a fresher one. Fastify would
append both, sending the same cookie twice.
*/
test('Setting the same cookie twice sends it once, with the last value', () => {
  const { reply, cookieNamed } = fakeReply()
  setAccessCookie(reply, 'first')
  setAccessCookie(reply, 'second')

  expect(cookieNamed(ACCESS_COOKIE_NAME)).toHaveLength(1)
  expect(cookieNamed(ACCESS_COOKIE_NAME)[0]).toMatch(new RegExp(`^${ACCESS_COOKIE_NAME}=second;`))
})

test('Replacing one cookie leaves the other untouched', () => {
  const { reply, cookies, cookieNamed } = fakeReply()
  setRefreshCookie(reply, 'refresh-value')
  setAccessCookie(reply, 'first')
  setAccessCookie(reply, 'second')

  expect(cookies()).toHaveLength(2)
  expect(cookieNamed(REFRESH_COOKIE_NAME)[0]).toMatch(
    new RegExp(`^${REFRESH_COOKIE_NAME}=refresh-value;`)
  )
})

test('A cookie that was set can be read back', () => {
  const { reply, cookies } = fakeReply()
  const token = 'aB3-_x.tokenValue'
  setRefreshCookie(reply, token)

  // Reconstruct what the browser would send back: name=value only, no flags
  const [nameValue] = cookies()[0].split(';')
  expect(getRefreshToken(requestWithCookie(nameValue))).toBe(token)
})

// -- clearing cookies --

// Without this the browser keeps presenting a cookie whose session row is gone
test('Logout expires both cookies', () => {
  const { reply, cookieNamed } = fakeReply()
  clearAuthCookies(reply)

  for (const name of [ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME]) {
    expect(cookieNamed(name)).toHaveLength(1)
    expect(cookieNamed(name)[0]).toContain('Max-Age=0')
  }
})

// A logout request can renew on its way in, so the clear has to win
test('Clearing after a set leaves only the expired cookie', () => {
  const { reply, cookies, cookieNamed } = fakeReply()
  setAccessCookie(reply, 'freshly-minted')
  clearAuthCookies(reply)

  expect(cookies()).toHaveLength(2)
  expect(cookieNamed(ACCESS_COOKIE_NAME)[0]).toContain('Max-Age=0')
  expect(cookieNamed(ACCESS_COOKIE_NAME)[0]).not.toContain('freshly-minted')
})

// The flags have to match the ones the cookie was set with, or the browser
// treats it as a different cookie and leaves the original in place
test('The expiring cookie carries the same flags as the one it replaces', () => {
  const { reply, cookieNamed } = fakeReply()
  clearAuthCookies(reply)

  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/'])
    expect(cookieNamed(ACCESS_COOKIE_NAME)[0]).toContain(flag)
})
