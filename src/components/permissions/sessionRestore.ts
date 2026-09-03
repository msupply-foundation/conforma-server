import databaseConnect from '../database/databaseConnect'
import { CapturedSession } from '../../types'
import { DEFAULT_SYSTEM_ORG_ID } from '../../constants'
import { getSessionLifetimeMinutes } from './userSessions'
import { authLog, quoted, sessionRef } from './authLog'
import { errorMessage } from '../utilityFunctions'

/*
Carrying one session across a database restore -- see kdd/auth-token-lifecycle §2

A restore drops the whole "public" schema before loading the dump, so every
session on the server goes with it, including that of the admin who asked for
the restore. They would be logged out by their own action, halfway through it,
and the web app's restore flow could not finish its own clean-up. So that one
session is read out beforehand and written back afterwards.

It is re-resolved rather than replaced verbatim. A restore swaps the entire
dataset, so the user id the session was issued against may now belong to
somebody else, and the point of the exercise is that the admin comes back as
themselves or not at all.

Nothing here may fail a restore. A session that cannot be carried across leaves
the admin logging in again, which is an inconvenience; a restore that stops
half way through leaves a broken system.
*/

/*
Reads the session out ahead of the restore. Returns null when there is nothing
to carry across: a caller with no refresh cookie -- the snapshot CLI, a startup
snapshot, a machine client presenting only a bearer token -- has no session to
lose, so this is a no-op rather than a problem.
*/
export const captureSessionForRestore = async (
  tokenHash?: string
): Promise<CapturedSession | null> => {
  if (!tokenHash) return null

  try {
    const session = await databaseConnect.getUserSessionForRestore(tokenHash)
    if (!session) {
      authLog(`Session ${sessionRef(tokenHash)} not found, nothing to preserve across restore`)
      return null
    }
    return session
  } catch (err) {
    authLog(`Problem reading session ${sessionRef(tokenHash)} before restore:`, errorMessage(err))
    return null
  }
}

/*
Writes the captured session back once the restored database is migrated and its
policies are in place.

Only the system org survives. Every other org id addresses a row in the dataset
that has just been replaced, so it is cleared and the user picks an org again;
keeping it would either break the foreign key or silently place them in an
unrelated organisation.
*/
export const reinstateCapturedSession = async (session: CapturedSession | null) => {
  if (!session) return

  const { tokenHash, username, orgId } = session

  try {
    const userId = await databaseConnect.reinstateUserSession(
      { ...session, orgId: orgId === DEFAULT_SYSTEM_ORG_ID ? DEFAULT_SYSTEM_ORG_ID : null },
      getSessionLifetimeMinutes()
    )

    if (userId === undefined) {
      authLog(
        `Session ${sessionRef(tokenHash)} not preserved:`,
        `no user ${quoted(username)} in the restored data`
      )
      return
    }

    authLog(
      `Session ${sessionRef(tokenHash)} preserved across restore for user ${quoted(username)}`
    )
  } catch (err) {
    authLog(
      `Problem preserving session ${sessionRef(tokenHash)} across restore:`,
      errorMessage(err)
    )
  }
}
