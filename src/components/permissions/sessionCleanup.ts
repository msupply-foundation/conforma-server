import databaseConnect from '../database/databaseConnect'
import { SESSION_CLEANUP_INTERVAL } from '../../constants'
import { notifyExpiredSessions, trackedSessionHashes } from './sessionSockets'
import { errorMessage } from '../utilityFunctions'

/*
Deletes expired sessions and tells any still-connected client that its session
has ended -- see kdd/auth-token-lifecycle §5.

Deliberately a plain setInterval rather than a scheduler.ts job: scheduler.ts
exists for customisable, user-editable schedules, and nothing about this is
configurable.

It is housekeeping, not enforcement. A session stops working the moment it
expires, because every lookup filters on expires_at -- this only stops dead rows
accumulating (every hit on a public form URL creates one, bots included) and
gives idle clients a nudge they would otherwise never get.
*/

const sweepExpiredSessions = async () => {
  try {
    const expired = await databaseConnect.deleteExpiredUserSessions()

    // Notifying is driven by what the connected clients believe, not by what
    // this delete removed, so that a session which went some other way -- an
    // admin, direct SQL, a snapshot restore -- is caught too. Deleting a
    // session announces itself where we control the delete (see endSessions),
    // which is faster; this is the net under everything else.
    //
    // The query is bounded by the number of connected sockets rather than the
    // size of the table, and token_hash is the primary key, so it is a handful
    // of index probes.
    const tracked = trackedSessionHashes()
    const live = tracked.length > 0 ? await databaseConnect.getLiveUserSessions(tracked) : []
    const liveHashes = new Set(live)
    const gone = tracked.filter((tokenHash) => !liveHashes.has(tokenHash))

    const notified = gone.length > 0 ? notifyExpiredSessions(gone) : 0

    if (expired.length === 0 && notified === 0) return

    console.log(
      `Removed ${expired.length} expired session(s)` +
        (notified > 0 ? `, notified ${notified} connected client(s)` : '')
    )
  } catch (err) {
    // Runs forever on a timer, so a transient database problem must not kill
    // the loop -- the next tick will pick up whatever this one missed
    console.log('Problem sweeping expired sessions:', errorMessage(err))
  }
}

export const startSessionCleanup = () => {
  const timer = setInterval(sweepExpiredSessions, SESSION_CLEANUP_INTERVAL)
  // Don't hold the process open just for this
  timer.unref()
  return timer
}
