import databaseConnect from '../database/databaseConnect'
import { SESSION_CLEANUP_INTERVAL } from '../../constants'
import { notifyExpiredSessions, trackedSessionHashes } from './sessionSockets'
import { authLog } from './authLog'
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

/*
A database restore replaces the whole dataset, and for its duration the session
table is either absent or the incoming snapshot's -- neither of which says
anything about the sessions this server's clients are holding. Sweeping then
would find every connected client's session "gone" and tell them all so, which
for the admin running the restore would undo the very session being preserved
for them (see sessionRestore.ts). The restore is long enough to span several
ticks, so it has to suspend the sweep rather than race it.
*/
let sweepPaused = false

export const pauseSessionSweep = () => {
  sweepPaused = true
}

export const resumeSessionSweep = () => {
  sweepPaused = false
}

const sweepExpiredSessions = async () => {
  if (sweepPaused) return

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

    // Notifying logs what it told whom, so only the housekeeping is reported
    // here -- and only when there was any, since this runs forever on a timer
    if (gone.length > 0) notifyExpiredSessions(gone)

    if (expired.length > 0) authLog(`Swept ${expired.length} expired session(s)`)
  } catch (err) {
    // Runs forever on a timer, so a transient database problem must not kill
    // the loop -- the next tick will pick up whatever this one missed
    authLog('Problem sweeping expired sessions:', errorMessage(err))
  }
}

export const startSessionCleanup = () => {
  const timer = setInterval(sweepExpiredSessions, SESSION_CLEANUP_INTERVAL)
  // Don't hold the process open just for this
  timer.unref()
  return timer
}
