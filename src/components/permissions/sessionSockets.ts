import { FastifyRequest } from 'fastify'
import { WebSocket } from '@fastify/websocket'
import { getRefreshToken } from './sessionCookies'
import { hashRefreshToken } from './userSessions'
import { errorMessage } from '../utilityFunctions'

/*
Tracks which websockets belong to which session, so the expiry sweep can tell a
client its session has ended -- see kdd/auth-token-lifecycle §5.

An idle client makes no requests, so nothing would otherwise tell it the session
is over; it would sit on a dead session until the user came back and got a 401.

Targeted delivery matters here because the existing broadcast goes to EVERY
connected client. Telling every browser on the system that a session expired
because one did would be worse than saying nothing. Cookie transport is what
makes the match possible: the websocket handshake carries the refresh cookie
like any other request, so the session is known at connect time.

This is a refinement on the reactive path, not load-bearing. If a client isn't
matched it simply finds out on its next request, which 401s and returns it to
login -- no worse than before, where a client-side timer was the only thing that
noticed.
*/

const SESSION_EXPIRED_MESSAGE = JSON.stringify({ type: 'session-expired' })

// One session can hold several sockets (a couple of tabs on one login), so the
// value is a set rather than a single socket.
const socketsBySession = new Map<string, Set<WebSocket>>()

/*
Called when a socket connects. A connection with no refresh cookie -- an
anonymous client, or one that connected before logging in -- is simply not
tracked, and gets no expiry notification.
*/
export const trackSessionSocket = (socket: WebSocket, request: FastifyRequest) => {
  const refreshToken = getRefreshToken(request)
  if (!refreshToken) return

  const tokenHash = hashRefreshToken(refreshToken)

  const sockets = socketsBySession.get(tokenHash) ?? new Set<WebSocket>()
  sockets.add(socket)
  socketsBySession.set(tokenHash, sockets)

  socket.on('close', () => {
    const remaining = socketsBySession.get(tokenHash)
    if (!remaining) return

    remaining.delete(socket)
    // Don't leave an empty set behind, or the map grows for the life of the
    // process as clients come and go
    if (remaining.size === 0) socketsBySession.delete(tokenHash)
  })
}

/*
The sessions currently holding at least one socket. The sweep asks the database
which of these still exist, so a client whose session went by a route that
announces nothing -- an admin, direct SQL, a snapshot restore -- is still told.
*/
export const trackedSessionHashes = () => Array.from(socketsBySession.keys())

/*
Tells any live socket belonging to these sessions that they have ended. Called
with the sessions a delete just removed, and by the sweep with any tracked
session the database no longer has.
*/
export const notifyExpiredSessions = (tokenHashes: string[]) => {
  let notified = 0

  for (const tokenHash of tokenHashes) {
    const sockets = socketsBySession.get(tokenHash)
    if (!sockets) continue

    for (const socket of sockets) {
      try {
        socket.send(SESSION_EXPIRED_MESSAGE)
        notified++
      } catch (err) {
        // A socket that has gone away shouldn't stop the others being told
        console.log('Could not notify expired session:', errorMessage(err))
      }
    }
    socketsBySession.delete(tokenHash)
  }

  return notified
}

// Exposed for tests
export const trackedSessionCount = () => socketsBySession.size
