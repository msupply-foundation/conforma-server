import { createHash, randomBytes } from 'crypto'
import databaseConnect from '../database/databaseConnect'
import config from '../../config'
import {
  ACCESS_TOKEN_TIME_DIVISOR,
  DEFAULT_LOGOUT_TIME,
  MAX_ACCESS_TOKEN_TIME,
  MIN_ACCESS_TOKEN_TIME,
  NON_REGISTERED_USER_ID,
  NO_EXPIRY_SESSION_TIME,
  PUBLIC_SESSION_TIME,
} from '../../constants'

/*
Server-side login sessions -- see kdd/auth-token-lifecycle/draft-kdd.md

A session is one login, held in the "user_session" table and identified by a
long random refresh token. Only the SHA-256 hash of that token is stored (as the
primary key), so the plain token exists exactly once, in the response that
creates the session.

Two clocks:
  - the access token's "exp": how long a stateless JWT is honoured. Set at mint
    and never updated -- a new token is minted instead.
  - the session's "expires_at": the inactivity window, extended whenever an
    access token is minted for it.
*/

const REFRESH_TOKEN_BYTES = 32

const getInactivityTime = () => config.logoutAfterInactivity ?? DEFAULT_LOGOUT_TIME

// How long a session survives without activity. A "logoutAfterInactivity" of 0
// means auto-logout is disabled, so the session is kept effectively forever.
export const getSessionLifetimeMinutes = (userId: number) => {
  if (userId === NON_REGISTERED_USER_ID) return PUBLIC_SESSION_TIME

  const inactivityTime = getInactivityTime()
  return inactivityTime === 0 ? NO_EXPIRY_SESSION_TIME : inactivityTime
}

// A fraction of the inactivity window, since an expired access token is renewed
// silently against the session rather than logging the user out. Capped at
// MAX_ACCESS_TOKEN_TIME so a very long (or disabled) inactivity window doesn't
// hand out a near-immortal token, and floored so a very short one doesn't
// produce a token that has expired by the time it arrives.
export const getAccessTokenLifetimeMinutes = () => {
  const inactivityTime = getInactivityTime()
  if (inactivityTime === 0) return MAX_ACCESS_TOKEN_TIME

  return Math.min(
    Math.max(Math.floor(inactivityTime / ACCESS_TOKEN_TIME_DIVISOR), MIN_ACCESS_TOKEN_TIME),
    MAX_ACCESS_TOKEN_TIME
  )
}

export const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex')

/*
Creates a new session and returns its refresh token in plain text -- the only
time it is available. Logging in again does NOT end existing sessions: a user
must be able to be logged in from more than one browser at once.
*/
export const createSession = async ({
  userId,
  sessionId,
  orgId,
}: {
  userId: number
  sessionId: string
  orgId?: number
}) => {
  const token = randomBytes(REFRESH_TOKEN_BYTES).toString('base64url')
  const expiresAt = new Date(Date.now() + getSessionLifetimeMinutes(userId) * 60_000)

  await databaseConnect.createUserSession({
    tokenHash: hashRefreshToken(token),
    userId,
    // null only at the database boundary, where it is the column's value
    orgId: orgId ?? null,
    sessionId,
    expiresAt,
  })

  return { token, expiresAt }
}

/*
Switching organisation updates the existing session rather than starting a new
one, so that a later silent renewal reproduces the org the user is actually in
(getUserInfo merges org-granted permissions, so it is authorisation state, not a
display preference). Returns false if the token doesn't match a live session.
*/
export const setSessionOrg = async (refreshToken: string, orgId: number | null) =>
  await databaseConnect.setUserSessionOrg(hashRefreshToken(refreshToken), orgId)
