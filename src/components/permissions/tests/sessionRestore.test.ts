import { DEFAULT_SYSTEM_ORG_ID } from '../../../constants'
import { CapturedSession } from '../../../types'
import type * as SessionRestoreModule from '../sessionRestore'

const getUserSessionForRestore = jest.fn()
const reinstateUserSession = jest.fn()

/*
See userSessions.test.ts for why this is doMock + require rather than an import:
databaseConnect opens a Postgres pool when it is imported, and ts-jest 26 cannot
hoist a jest.mock call under TypeScript 5.
*/
jest.doMock('../../database/databaseConnect', () => ({
  __esModule: true,
  default: { getUserSessionForRestore, reinstateUserSession },
}))

const {
  captureSessionForRestore,
  reinstateCapturedSession,
}: typeof SessionRestoreModule = require('../sessionRestore')

const TOKEN_HASH = 'a'.repeat(64)

const captured = (orgId: number | null): CapturedSession => ({
  tokenHash: TOKEN_HASH,
  username: 'carl',
  orgId,
  sessionId: 'session-abc',
  expiresAt: new Date('2026-09-04T12:00:00Z'),
})

afterEach(() => jest.clearAllMocks())

// -- captureSessionForRestore --

test('A caller with no refresh token has no session to preserve', async () => {
  expect(await captureSessionForRestore(undefined)).toBeNull()
  expect(getUserSessionForRestore).not.toHaveBeenCalled()
})

test('The session is read out by its token hash', async () => {
  const session = captured(null)
  getUserSessionForRestore.mockResolvedValue(session)

  expect(await captureSessionForRestore(TOKEN_HASH)).toBe(session)
  expect(getUserSessionForRestore).toHaveBeenCalledWith(TOKEN_HASH)
})

test('A token hash matching no session captures nothing', async () => {
  getUserSessionForRestore.mockResolvedValue(undefined)

  expect(await captureSessionForRestore(TOKEN_HASH)).toBeNull()
})

// A restore must complete even when the session cannot be carried across it
test('A database failure while capturing is swallowed', async () => {
  getUserSessionForRestore.mockRejectedValue(new Error('no such table'))

  expect(await captureSessionForRestore(TOKEN_HASH)).toBeNull()
})

// -- reinstateCapturedSession --

test('Nothing captured means nothing reinstated', async () => {
  await reinstateCapturedSession(null)

  expect(reinstateUserSession).not.toHaveBeenCalled()
})

// The system org is the one id that addresses the same organisation in the
// restored data as it did in the data it replaced
test('The system org is carried across', async () => {
  reinstateUserSession.mockResolvedValue(7)

  await reinstateCapturedSession(captured(DEFAULT_SYSTEM_ORG_ID))

  expect(reinstateUserSession).toHaveBeenCalledWith(
    expect.objectContaining({ orgId: DEFAULT_SYSTEM_ORG_ID }),
    expect.any(Number)
  )
})

test('Any other org is cleared, so the user picks one again', async () => {
  reinstateUserSession.mockResolvedValue(7)

  await reinstateCapturedSession(captured(23))

  expect(reinstateUserSession).toHaveBeenCalledWith(
    expect.objectContaining({ orgId: null }),
    expect.any(Number)
  )
})

test('The session is reinstated by username, not by user id', async () => {
  reinstateUserSession.mockResolvedValue(7)

  await reinstateCapturedSession(captured(null))

  const [session] = reinstateUserSession.mock.calls[0]
  expect(session).toMatchObject({
    tokenHash: TOKEN_HASH,
    username: 'carl',
    sessionId: 'session-abc',
  })
  expect(session).not.toHaveProperty('userId')
})

// The honest outcome: they have no account on the restored system
test('A username absent from the restored data reinstates nothing', async () => {
  reinstateUserSession.mockResolvedValue(undefined)

  await expect(reinstateCapturedSession(captured(null))).resolves.toBeUndefined()
})

test('A database failure while reinstating is swallowed', async () => {
  reinstateUserSession.mockRejectedValue(new Error('constraint violation'))

  await expect(reinstateCapturedSession(captured(null))).resolves.toBeUndefined()
})
