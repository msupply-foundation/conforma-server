import { FastifyRequest } from 'fastify'
import { WebSocket } from '@fastify/websocket'
import { REFRESH_COOKIE_NAME } from '../sessionCookies'
import { sessionRef } from '../authLog'
import type * as SessionSocketsModule from '../sessionSockets'

// See userSessions.test.ts for why this is doMock + require rather than
// jest.mock. sessionSockets reaches the database only through hashRefreshToken's
// module, which does not touch it, but userSessions imports databaseConnect.
jest.doMock('../../database/databaseConnect', () => ({ __esModule: true, default: {} }))

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

// The registry is module state, so each test has to leave it empty
afterEach(() => {
  expect(trackedSessionCount()).toBe(0)
})

test('A tracked socket is told when its session expires', () => {
  const { socket, sent, close } = fakeSocket()
  trackSessionSocket(socket, requestWith('token-a'))

  expect(expire('token-a')).toBe(1)
  expect(sent).toEqual([JSON.stringify({ type: 'session-expired' })])
  close()
})

/*
The existing broadcast (notifyClients) goes to EVERY connected client. Telling
every browser on the system that a session expired because one did would be
worse than saying nothing, so delivery has to be per-session.
*/
test('Only the expired session is notified, not every connected client', () => {
  const a = fakeSocket()
  const b = fakeSocket()
  trackSessionSocket(a.socket, requestWith('token-a'))
  trackSessionSocket(b.socket, requestWith('token-b'))

  expire('token-a')

  expect(a.sent).toHaveLength(1)
  expect(b.sent).toHaveLength(0)

  a.close()
  b.close()
})

// One login can have several tabs open
test('Every socket on a session is notified', () => {
  const first = fakeSocket()
  const second = fakeSocket()
  trackSessionSocket(first.socket, requestWith('token-a'))
  trackSessionSocket(second.socket, requestWith('token-a'))

  expect(expire('token-a')).toBe(2)
  expect(first.sent).toHaveLength(1)
  expect(second.sent).toHaveLength(1)

  first.close()
  second.close()
})

// A client that connected before logging in has nothing to match on, and simply
// finds out on its next request instead
test('A socket with no refresh cookie is not tracked', () => {
  const { socket, sent } = fakeSocket()
  trackSessionSocket(socket, requestWith())

  expect(trackedSessionCount()).toBe(0)
  expect(sent).toHaveLength(0)
})

test('Expiring a session nobody is connected to is harmless', () => {
  expect(notifyExpiredSessions(['no-such-hash'])).toBe(0)
})

test('Closing a socket stops it being tracked', () => {
  const { socket, sent, close } = fakeSocket()
  trackSessionSocket(socket, requestWith('token-a'))
  expect(trackedSessionCount()).toBe(1)

  close()

  expect(trackedSessionCount()).toBe(0)
  expect(expire('token-a')).toBe(0)
  expect(sent).toHaveLength(0)
})

// Otherwise the map grows for the life of the process as clients come and go
test('A session is forgotten only once its last socket closes', () => {
  const first = fakeSocket()
  const second = fakeSocket()
  trackSessionSocket(first.socket, requestWith('token-a'))
  trackSessionSocket(second.socket, requestWith('token-a'))

  first.close()
  expect(trackedSessionCount()).toBe(1)

  second.close()
  expect(trackedSessionCount()).toBe(0)
})

test('Notifying releases the session, so nothing is left behind', () => {
  const { socket, close } = fakeSocket()
  trackSessionSocket(socket, requestWith('token-a'))

  expire('token-a')

  expect(trackedSessionCount()).toBe(0)
  close()
})

// One dead socket must not stop the rest of a session being told
test('A socket that throws on send does not block the others', () => {
  const broken = {
    send: () => {
      throw new Error('socket is gone')
    },
    on: () => {},
  } as unknown as WebSocket
  const working = fakeSocket()

  trackSessionSocket(broken, requestWith('token-a'))
  trackSessionSocket(working.socket, requestWith('token-a'))

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
test('A session whose sockets all fail is not reported as told', () => {
  const broken = {
    send: () => {
      throw new Error('socket is gone')
    },
    on: () => {},
  } as unknown as WebSocket
  const working = fakeSocket()

  // Order matters: the working session is notified first, so a batch-wide count
  // would already be above zero by the time the broken one is reached
  trackSessionSocket(working.socket, requestWith('token-a'))
  trackSessionSocket(broken, requestWith('token-b'))

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
