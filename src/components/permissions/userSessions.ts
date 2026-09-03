import { createHash } from 'crypto'
import { nanoid } from 'nanoid'
import databaseConnect from '../database/databaseConnect'
import config from '../../config'
import { UserSession } from '../../types'
import {
  ACCESS_TOKEN_TIME_DIVISOR,
  DEFAULT_LOGOUT_TIME,
  MAX_ACCESS_TOKEN_TIME,
  MIN_ACCESS_TOKEN_TIME,
  NON_REGISTERED_USER_ID,
  NO_EXPIRY_SESSION_TIME,
  PUBLIC_SESSION_TIME,
} from '../../constants'
import { notifyExpiredSessions } from './sessionSockets'

/*
Server-side login sessions -- see kdd/auth-token-lifecycle

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

// 32 characters from nanoid's 64-character alphabet, so 192 bits from the same
// CSPRNG the rest of the codebase's ids use -- longer than a nanoid identifier
// because this one is a credential, not just a unique string.
const REFRESH_TOKEN_LENGTH = 32

const getInactivityTime = () => config.logoutAfterInactivity ?? DEFAULT_LOGOUT_TIME

// How long a session survives without activity. A "logoutAfterInactivity" of 0
// means auto-logout is disabled, so the session is kept effectively forever.
const getStandardSessionLifetimeMinutes = () => {
  const inactivityTime = getInactivityTime()
  return inactivityTime === 0 ? NO_EXPIRY_SESSION_TIME : inactivityTime
}

// An unknown user gets the standard window. That is only ever a fallback for
// renewal, where the session may belong to a caller that presented no access
// token to identify itself -- and it is safe because extending can never
// shorten a session (see extendUserSessionIfValid).
export const getSessionLifetimeMinutes = (userId?: number) =>
  userId === NON_REGISTERED_USER_ID ? PUBLIC_SESSION_TIME : getStandardSessionLifetimeMinutes()

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
  lifetimeMinutes,
}: {
  userId: number
  sessionId: string
  orgId?: number
  // Overrides the usual inactivity window. Only for admin-provisioned sessions
  // (machine clients), which need a far-future expiry rather than one that
  // lapses whenever the integration goes quiet.
  lifetimeMinutes?: number
}) => {
  const token = nanoid(REFRESH_TOKEN_LENGTH)
  const tokenHash = hashRefreshToken(token)
  const expiresAt = new Date(
    Date.now() + (lifetimeMinutes ?? getSessionLifetimeMinutes(userId)) * 60_000
  )

  await databaseConnect.createUserSession({
    tokenHash,
    userId,
    // null only at the database boundary, where it is the column's value
    orgId: orgId ?? null,
    sessionId,
    expiresAt,
  })

  // The hash is returned alongside the token so callers can identify the
  // session -- in a log, say -- without handling the credential itself
  return { token, tokenHash, expiresAt }
}

/*
Renews the session a refresh token belongs to: extends its inactivity window and
returns the row, in a single statement (see extendUserSessionIfValid). Returns
null when there is no live session -- revoked, expired and never-existed are
deliberately indistinguishable from here.

"userId" only sets how long to extend by, and may be omitted when the caller has
no way to tell whose session it is. It is never used to find the session -- the
token hash alone does that.

This is the only session read on the request path, and it only happens when
there is no usable access token: a valid one verifies on its own signature and
never reaches the table. So an active client costs one write per access-token
lifetime, not one per request.
*/
export const renewSession = async (
  refreshToken: string,
  userId?: number
): Promise<UserSession | null> =>
  (await databaseConnect.extendUserSessionIfValid(
    hashRefreshToken(refreshToken),
    getSessionLifetimeMinutes(userId)
  )) ?? null

/*
Ends sessions on logout. There is one Logout action in the UI, so logging 
out ends every session for that user -- note the deliberate asymmetry with 
login, which revokes nothing.

The shared public account is the exception, and it has to be: every public
applicant shares its user_id, so ending "all" of its sessions would end every
in-progress public form on the system at once. It collapses to ending just this
one -- a defined behaviour rather than an exclusion, so it cannot be invoked by
accident.
*/
export const endSessions = async (userId: number, refreshToken: string | null) => {
  const ended =
    userId === NON_REGISTERED_USER_ID
      ? refreshToken
        ? await databaseConnect.deleteUserSession(hashRefreshToken(refreshToken))
        : []
      : await databaseConnect.deleteUserSessionsByUserId(userId)

  // Logging out ends every session for the user, so the browsers behind the
  // other ones are told straight away rather than waiting for the sweep to
  // notice. The sweep only reports what it deletes itself, so without this a
  // logout elsewhere would go unannounced for up to its interval.
  notifyExpiredSessions(ended)

  return ended.length
}

/*
Switching organisation updates the existing session rather than starting a new
one, so that a later silent renewal reproduces the org the user is actually in
(getUserInfo merges org-granted permissions, so it is authorisation state, not a
display preference). Returns false if the token doesn't match a live session.
*/
export const setSessionOrg = async (refreshToken: string, orgId: number | null) =>
  await databaseConnect.setUserSessionOrg(hashRefreshToken(refreshToken), orgId)
