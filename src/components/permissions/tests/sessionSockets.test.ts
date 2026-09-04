import { FastifyRequest } from 'fastify'
import { WebSocket } from '@fastify/websocket'
import { REFRESH_COOKIE_NAME } from '../sessionCookies'
import { sessionRef } from '../authLog'
import type * as SessionSocketsModule from '../sessionSockets'

// See userSessions.test.ts for why this is doMock + require rather than
// jest.mock. Tracking asks the database whether the session behind a socket is
// still live, and userSessions (for hashRefreshToken) imports databaseConnect too.
const getLiveUserSessions = jest.fn()
jest.doMock('../../database/databaseConnect', () => ({
  __esModule: true,
  default: { getLiveUserSessions },
}))

const {
  notifyExpiredSessions,
  trackSessionSocket,
  trackedSessionCount,
}: typeof SessionSocketsModule = require('../sessionSockets')

const { hashRefreshToken } = require('../userSessions')

const requestWith = (refreshToken?: string) =>
  ({
    headers: refreshToken ? { cookie: `${REFRESH_COOKIE_NAME}=${refreshToken}` } : {},
  }) as FastifyRequest

// Enough of a socket for what the registry touches: send, and a close handler
const fakeSocket = () => {
  const sent: string[] = []
  let closeHandler = () => {}
  const socket = {
    send: (message: string) => sent.push(message),
    on: (event: string, handler: () => void) => {
      if (event === 'close') closeHandler = handler
    },
  }
  return { socket: socket as unknown as WebSocket, sent, close: () => closeHandler() }
}

const expire = (refreshToken: string) => notifyExpiredSessions([hashRefreshToken(refreshToken)])

beforeEach(() => {
  // Live unless a test says otherwise -- the query returns the hashes it found
  getLiveUserSessions.mockImplementation(async (hashes: string[]) => hashes)
})

// The registry is module state, so each test has to leave it empty
afterEach(() => {
  jest.clearAllMocks()
  expect(trackedSessionCount()).toBe(0)
})

test('A tracked socket is told when its session expires', async () => {
  const { socket, sent, close } = fakeSocket()
  await trackSessionSocket(socket, requestWith('token-a'))

  expect(expire('token-a')).toBe(1)
  expect(sent).toEqual([JSON.stringify({ type: 'session-expired' })])
  close()
})

/*
The existing broadcast (notifyClients) goes to EVERY connected client. Telling
every browser on the system that a session expired because one did would be
worse than saying nothing, so delivery has to be per-session.
*/
test('Only the expired session is notified, not every connected client', async () => {
  const a = fakeSocket()
  const b = fakeSocket()
  await trackSessionSocket(a.socket, requestWith('token-a'))
  await trackSessionSocket(b.socket, requestWith('token-b'))

  expire('token-a')

  expect(a.sent).toHaveLength(1)
  expect(b.sent).toHaveLength(0)

  a.close()
  b.close()
})

// One login can have several tabs open
test('Every socket on a session is notified', async () => {
  const first = fakeSocket()
  const second = fakeSocket()
  await trackSessionSocket(first.socket, requestWith('token-a'))
  await trackSessionSocket(second.socket, requestWith('token-a'))

  expect(expire('token-a')).toBe(2)
  expect(first.sent).toHaveLength(1)
  expect(second.sent).toHaveLength(1)

  first.close()
  second.close()
})

// A client that connected before logging in has nothing to match on, and simply
// finds out on its next request instead
test('A socket with no refresh cookie is not tracked', async () => {
  const { socket, sent } = fakeSocket()
  await trackSessionSocket(socket, requestWith())

  expect(trackedSessionCount()).toBe(0)
  expect(sent).toHaveLength(0)
})

/*
A browser cannot discard an HttpOnly cookie itself, and the 101 upgrade response
cannot clear it either, so a client already back at the login screen may still
present the cookie for a session that has gone. Tracking it would have the sweep
report the same dead session on every pass -- and the client reload that follows
brings back another socket with the same cookie, so it never ends.
*/
test('A socket whose session has gone is not tracked', async () => {
  const { socket, sent } = fakeSocket()
  getLiveUserSessions.mockResolvedValue([])

  await trackSessionSocket(socket, requestWith('token-a'))

  expect(trackedSessionCount()).toBe(0)
  expect(expire('token-a')).toBe(0)
  expect(sent).toHaveLength(0)
})

// Not tracking costs a prompt notification, and the client still finds out on
// its next request. Tracking a session we failed to confirm risks the loop above
test('A socket is not tracked when the session cannot be confirmed', async () => {
  const { socket } = fakeSocket()
  getLiveUserSessions.mockRejectedValue(new Error('database is down'))

  const logged = jest.spyOn(console, 'log').mockImplementation(() => {})
  await expect(trackSessionSocket(socket, requestWith('token-a'))).resolves.toBeUndefined()
  logged.mockRestore()

  expect(trackedSessionCount()).toBe(0)
})

test('Expiring a session nobody is connected to is harmless', async () => {
  expect(notifyExpiredSessions(['no-such-hash'])).toBe(0)
})

test('Closing a socket stops it being tracked', async () => {
  const { socket, sent, close } = fakeSocket()
  await trackSessionSocket(socket, requestWith('token-a'))
  expect(trackedSessionCount()).toBe(1)

  close()

  expect(trackedSessionCount()).toBe(0)
  expect(expire('token-a')).toBe(0)
  expect(sent).toHaveLength(0)
})

// Otherwise the map grows for the life of the process as clients come and go
test('A session is forgotten only once its last socket closes', async () => {
  const first = fakeSocket()
  const second = fakeSocket()
  await trackSessionSocket(first.socket, requestWith('token-a'))
  await trackSessionSocket(second.socket, requestWith('token-a'))

  first.close()
  expect(trackedSessionCount()).toBe(1)

  second.close()
  expect(trackedSessionCount()).toBe(0)
})

test('Notifying releases the session, so nothing is left behind', async () => {
  const { socket, close } = fakeSocket()
  await trackSessionSocket(socket, requestWith('token-a'))

  expire('token-a')

  expect(trackedSessionCount()).toBe(0)
  close()
})

// One dead socket must not stop the rest of a session being told
test('A socket that throws on send does not block the others', async () => {
  const broken = {
    send: () => {
      throw new Error('socket is gone')
    },
    on: () => {},
  } as unknown as WebSocket
  const working = fakeSocket()

  await trackSessionSocket(broken, requestWith('token-a'))
  await trackSessionSocket(working.socket, requestWith('token-a'))

  expect(() => expire('token-a')).not.toThrow()
  expect(working.sent).toHaveLength(1)

  working.close()
})

/*
The log line names the sessions it reached, and a batch is the normal case --
the sweep notifies every tracked session the database no longer has at once. A
count kept across the batch rather than per session would stay above zero once
any earlier session succeeded, and so claim every later one whose sockets all
failed.
*/
test('A session whose sockets all fail is not reported as told', async () => {
  const broken = {
    send: () => {
      throw new Error('socket is gone')
    },
    on: () => {},
  } as unknown as WebSocket
  const working = fakeSocket()

  // Order matters: the working session is notified first, so a batch-wide count
  // would already be above zero by the time the broken one is reached
  await trackSessionSocket(working.socket, requestWith('token-a'))
  await trackSessionSocket(broken, requestWith('token-b'))

  const logged = jest.spyOn(console, 'log').mockImplementation(() => {})
  const notified = notifyExpiredSessions([hashRefreshToken('token-a'), hashRefreshToken('token-b')])
  const lines = logged.mock.calls.map((call) => call.join(' '))
  logged.mockRestore()

  expect(notified).toBe(1)

  const told = lines.find((line) => line.includes('their session ended')) ?? ''
  expect(told).toContain(sessionRef(hashRefreshToken('token-a')))
  expect(told).not.toContain(sessionRef(hashRefreshToken('token-b')))

  working.close()
})
