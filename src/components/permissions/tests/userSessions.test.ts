import config from '../../../config'
import { NO_EXPIRY_SESSION_TIME } from '../../../constants'
import type * as UserSessionsModule from '../userSessions'

const createUserSession = jest.fn()
const setUserSessionOrg = jest.fn()
const extendUserSessionIfValid = jest.fn()
const deleteUserSession = jest.fn()
const deleteUserSessionsByUserId = jest.fn()

/*
userSessions imports databaseConnect, which opens a Postgres pool as a side
effect of being imported. Replacing it keeps these as pure unit tests that need
no database.

This uses `jest.doMock` + `require` rather than the usual hoisted `jest.mock`:
ts-jest 26 hoists via `ts.getMutableClone`, which TypeScript 5 removed, so a
`jest.mock` call fails to compile at all. `doMock` is not hoisted, so the
require below has to come after it.
*/
jest.doMock('../../database/databaseConnect', () => ({
  __esModule: true,
  default: {
    createUserSession,
    setUserSessionOrg,
    extendUserSessionIfValid,
    deleteUserSession,
    deleteUserSessionsByUserId,
  },
}))

const {
  createSession,
  endSessions,
  getAccessTokenLifetimeMinutes,
  getSessionLifetimeMinutes,
  renewSession,
  hashRefreshToken,
  setSessionOrg,
}: typeof UserSessionsModule = require('../userSessions')

const NON_REGISTERED_USER = 1
const ANY_OTHER_USER = 42

const originalLogoutTime = config.logoutAfterInactivity

afterEach(() => {
  config.logoutAfterInactivity = originalLogoutTime
  jest.clearAllMocks()
})

// -- getAccessTokenLifetimeMinutes --
// The KDD pins this as Math.min(logoutAfterInactivity / 12, 60) minutes.

test.each([
  [60, 5], // the default: a 1 h window gives 5 min
  [360, 30], // 6 h gives 30 min
  [720, 60], // 12 h is where the cap starts to bite
  [10080, 60], // a week is still capped at 1 h
  [6, 1], // floored, rather than rounding down to zero
  [1, 1],
])('Access token lifetime for an inactivity window of %i minutes is %i', (window, expected) => {
  config.logoutAfterInactivity = window
  expect(getAccessTokenLifetimeMinutes()).toBe(expected)
})

test('Access token lifetime falls back to the default window when unset', () => {
  config.logoutAfterInactivity = undefined
  expect(getAccessTokenLifetimeMinutes()).toBe(5)
})

// 0 means "no auto-logout", so it must not be read as "expire immediately"
test('An inactivity window of 0 gives the longest permitted access token', () => {
  config.logoutAfterInactivity = 0
  expect(getAccessTokenLifetimeMinutes()).toBe(60)
})

// -- getSessionLifetimeMinutes --

test('Session lifetime is the inactivity window itself', () => {
  config.logoutAfterInactivity = 360
  expect(getSessionLifetimeMinutes(ANY_OTHER_USER)).toBe(360)
})

test('Session lifetime falls back to the default window when unset', () => {
  config.logoutAfterInactivity = undefined
  expect(getSessionLifetimeMinutes(ANY_OTHER_USER)).toBe(60)
})

test('An inactivity window of 0 keeps sessions alive indefinitely', () => {
  config.logoutAfterInactivity = 0
  expect(getSessionLifetimeMinutes(ANY_OTHER_USER)).toBe(NO_EXPIRY_SESSION_TIME)
})

// Every hit on a public form URL creates a session, and they all share one
// account, so these get a day regardless of what staff logins are given.
test('The shared public account gets a one-day session, whatever the window', () => {
  config.logoutAfterInactivity = 10080
  expect(getSessionLifetimeMinutes(NON_REGISTERED_USER)).toBe(24 * 60)

  config.logoutAfterInactivity = 0
  expect(getSessionLifetimeMinutes(NON_REGISTERED_USER)).toBe(24 * 60)
})

// -- hashRefreshToken --

test('Hashing is SHA-256 hex, and deterministic', () => {
  expect(hashRefreshToken('hello')).toBe(
    '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
  )
  expect(hashRefreshToken('hello')).toBe(hashRefreshToken('hello'))
  expect(hashRefreshToken('hello')).not.toBe(hashRefreshToken('hello '))
  expect(hashRefreshToken('anything')).toMatch(/^[0-9a-f]{64}$/)
})

// -- createSession --

test('Creates a session and returns its token in plain text', async () => {
  const { token, expiresAt } = await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-1' })

  expect(typeof token).toBe('string')
  expect(token.length).toBeGreaterThan(30)
  expect(expiresAt).toBeInstanceOf(Date)
  expect(createUserSession).toHaveBeenCalledTimes(1)
})

// The plain token exists only in the response that creates it -- what is
// persisted must be the hash, or the table becomes a list of live credentials.
test('Persists the hash of the token, never the token itself', async () => {
  const { token } = await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-1' })
  const { tokenHash } = createUserSession.mock.calls[0][0]

  expect(tokenHash).not.toBe(token)
  expect(tokenHash).toBe(hashRefreshToken(token))
})

test('Issues a different token every time', async () => {
  const first = await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-1' })
  const second = await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-1' })

  expect(first.token).not.toBe(second.token)
})

// RLS evaluates this claim for public applicants, so a renewal has to reproduce
// it exactly -- it has to reach the row unaltered.
test('Stores the sessionId it was given, and no org by default', async () => {
  await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-abc' })
  const row = createUserSession.mock.calls[0][0]

  expect(row.sessionId).toBe('sess-abc')
  expect(row.userId).toBe(ANY_OTHER_USER)
  expect(row.orgId).toBeNull()
})

test('Stores an org when one is supplied', async () => {
  await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-abc', orgId: 7 })
  expect(createUserSession.mock.calls[0][0].orgId).toBe(7)
})

test('Sets expiry from the session lifetime, not the access token lifetime', async () => {
  config.logoutAfterInactivity = 360
  const before = Date.now()
  const { expiresAt } = await createSession({ userId: ANY_OTHER_USER, sessionId: 'sess-1' })
  const after = Date.now()

  expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + 360 * 60_000)
  expect(expiresAt.getTime()).toBeLessThanOrEqual(after + 360 * 60_000)
})

test('Gives the shared public account its shorter expiry', async () => {
  config.logoutAfterInactivity = 10080
  const before = Date.now()
  const { expiresAt } = await createSession({ userId: NON_REGISTERED_USER, sessionId: 'sess-1' })

  expect(expiresAt.getTime()).toBeLessThanOrEqual(before + 24 * 60 * 60_000)
  expect(expiresAt.getTime()).toBeGreaterThan(before)
})

// -- setSessionOrg --

test('Looks the session up by token hash, not by the raw token', async () => {
  setUserSessionOrg.mockResolvedValue(true)
  await setSessionOrg('raw-token', 7)

  expect(setUserSessionOrg).toHaveBeenCalledWith(hashRefreshToken('raw-token'), 7)
})

test('Passes a null org through, for "no organisation"', async () => {
  setUserSessionOrg.mockResolvedValue(true)
  await setSessionOrg('raw-token', null)

  expect(setUserSessionOrg).toHaveBeenCalledWith(hashRefreshToken('raw-token'), null)
})

test('Reports whether a live session was actually updated', async () => {
  setUserSessionOrg.mockResolvedValue(true)
  expect(await setSessionOrg('raw-token', 7)).toBe(true)

  setUserSessionOrg.mockResolvedValue(false)
  expect(await setSessionOrg('raw-token', 7)).toBe(false)
})

// -- renewSession --
// Read and extend are one statement, so a logout can't slip between them and
// leave us minting a token for a session that has just been revoked.

test('Looks a session up by the hash of the token, never the token', async () => {
  extendUserSessionIfValid.mockResolvedValue(undefined)
  await renewSession('raw-token', ANY_OTHER_USER)

  expect(extendUserSessionIfValid.mock.calls[0][0]).toBe(hashRefreshToken('raw-token'))
})

// Revoked, expired and never-existed all have to look the same from here
test('Returns null when there is no live session', async () => {
  extendUserSessionIfValid.mockResolvedValue(undefined)
  expect(await renewSession('raw-token')).toBeNull()
})

test('Returns the renewed session row when one is live', async () => {
  const session = { tokenHash: 'h', userId: 42, orgId: null, sessionId: 's', expiresAt: new Date() }
  extendUserSessionIfValid.mockResolvedValue(session)

  expect(await renewSession('raw-token')).toBe(session)
})

test('Extends by the window belonging to the given user', async () => {
  config.logoutAfterInactivity = 360
  extendUserSessionIfValid.mockResolvedValue(undefined)

  await renewSession('raw-token', ANY_OTHER_USER)
  expect(extendUserSessionIfValid.mock.calls[0][1]).toBe(360)

  await renewSession('raw-token', NON_REGISTERED_USER)
  expect(extendUserSessionIfValid.mock.calls[1][1]).toBe(24 * 60)
})

/*
A caller that presented no access token can't say whose session this is -- the
machine-client case. It falls back to the standard window, which is safe only
because extending can never shorten a session: a provisioned long-lived session
keeps its far-future expiry.
*/
test('An unknown user gets the standard window, not the public one', async () => {
  config.logoutAfterInactivity = 360
  extendUserSessionIfValid.mockResolvedValue(undefined)
  await renewSession('raw-token')

  expect(extendUserSessionIfValid.mock.calls[0][1]).toBe(360)
})

test('An inactivity window of 0 renews with the indefinite lifetime', async () => {
  config.logoutAfterInactivity = 0
  extendUserSessionIfValid.mockResolvedValue(undefined)
  await renewSession('raw-token')

  expect(extendUserSessionIfValid.mock.calls[0][1]).toBe(NO_EXPIRY_SESSION_TIME)
})

// -- endSessions --

// One Logout action in the UI means logout everywhere -- note the deliberate
// asymmetry with login, which revokes nothing.
test('Logging out ends every session the user has', async () => {
  deleteUserSessionsByUserId.mockResolvedValue(3)
  expect(await endSessions(ANY_OTHER_USER, 'raw-token')).toBe(3)

  expect(deleteUserSessionsByUserId).toHaveBeenCalledWith(ANY_OTHER_USER)
  expect(deleteUserSession).not.toHaveBeenCalled()
})

/*
Every public applicant shares the one account, so ending "all" of its sessions
would end every in-progress public form on the system at once.
*/
test('The shared public account only ever ends the session that asked', async () => {
  deleteUserSession.mockResolvedValue(1)
  expect(await endSessions(NON_REGISTERED_USER, 'raw-token')).toBe(1)

  expect(deleteUserSession).toHaveBeenCalledWith(hashRefreshToken('raw-token'))
  expect(deleteUserSessionsByUserId).not.toHaveBeenCalled()
})

test('The shared public account ends nothing when it presents no token', async () => {
  expect(await endSessions(NON_REGISTERED_USER, null)).toBe(0)

  expect(deleteUserSession).not.toHaveBeenCalled()
  expect(deleteUserSessionsByUserId).not.toHaveBeenCalled()
})

// The renewal path may not know whose session it is
test('The lifetime helper falls back to the standard window with no user', () => {
  config.logoutAfterInactivity = 360
  expect(getSessionLifetimeMinutes()).toBe(360)
  expect(getSessionLifetimeMinutes(NON_REGISTERED_USER)).toBe(24 * 60)
})
