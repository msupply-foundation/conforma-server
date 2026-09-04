import databaseConnect from '../database/databaseConnect'
import config from '../../config'
import { getUserInfo } from './loginHelpers'
import { createSession } from './userSessions'
import { UserOrg } from '../../types'
import { errorMessage } from '../utilityFunctions'
import { nanoid } from 'nanoid'

/*
Issues credentials for callers that can't log in through a browser -- machine
clients (mSupply, a peer Conforma server), a GraphQL app, or a support session.
See kdd/auth-token-lifecycle §4.

Two kinds, and the difference matters:

  session  A long-lived refresh token, backed by a user_session row. The client
           sends it as a refresh cookie and never logs in; the server mints
           short-lived access tokens for it on the ordinary renewal path.
           REVOCABLE -- delete the row and the integration stops, without
           touching the account.

  access   A signed JWT with a custom expiry and no session behind it. Simpler
           for a client to use (one header, no cookie jar), but NOT REVOCABLE:
           it verifies on its own signature, so it works until it expires no
           matter what happens to the account. Prefer "session" unless the
           client genuinely cannot hold a cookie.

Run with:
  yarn token session <username> [--org <id>] [--days <n>] [--session-id <id>]
  yarn token access  <username> [--org <id>] [--days <n>]
*/

const DEFAULT_DAYS = 365
const MINUTES_PER_DAY = 24 * 60

const usage = (isError = true) => {
  console.log(`
Issue a credential for a machine client or an app.

  yarn token session <username> [options]   long-lived refresh token (revocable)
  yarn token access  <username> [options]   standalone JWT (NOT revocable)

Options:
  --org <id>          scope the credential to an organisation
  --days <n>          how long it lasts (default: ${DEFAULT_DAYS})
  --session-id <id>   reuse a specific sessionId claim (session only)
`)
  process.exit(isError ? 1 : 0)
}

const getOption = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)
  if (index < 0) return undefined

  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) {
    console.log(`ERROR: --${name} must be followed by a value`)
    usage()
  }
  return value
}

const getNumericOption = (name: string): number | undefined => {
  const value = getOption(name)
  if (value === undefined) return undefined

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    console.log(`ERROR: --${name} must be a positive number, got "${value}"`)
    usage()
  }
  return parsed
}

const issueToken = async () => {
  const mode = process.argv[3]
  const username = process.argv[4]

  if (process.argv.includes('--help')) usage(false)
  if (mode !== 'session' && mode !== 'access') usage()
  if (!username || username.startsWith('--')) {
    console.log('ERROR: a username is required')
    usage()
  }

  const orgId = getNumericOption('org')
  const days = getNumericOption('days') ?? DEFAULT_DAYS

  const userOrgData: UserOrg[] = (await databaseConnect.getUserOrgData({ username })) ?? []
  if (userOrgData.length === 0) {
    console.log(`ERROR: no such user: "${username}"`)
    process.exit(1)
  }
  const userId = userOrgData[0].userId as number

  if (orgId && !userOrgData.some((row) => row.orgId === orgId)) {
    console.log(`ERROR: user "${username}" does not belong to organisation ${orgId}`)
    process.exit(1)
  }

  const { user, JWT } = await getUserInfo({
    userId,
    orgId,
    sessionId: getOption('session-id'),
    accessTokenLifetimeMinutes: days * MINUTES_PER_DAY,
  })

  // isAdmin means role: 'postgres', which bypasses every row-level policy. A
  // credential like that sitting in a partner's config file is a permanent
  // superuser key, so it is worth being loud about.
  if (user.isAdmin) {
    console.log(`
!! WARNING ------------------------------------------------------------------
!! "${username}" is an ADMIN. Its tokens run as the Postgres superuser and
!! bypass ALL row-level security. For a machine client, use a dedicated
!! non-admin service account granted only the permissions it needs.
!! ---------------------------------------------------------------------------`)
  }

  if (mode === 'access') {
    console.log(`
Access token for "${username}"${orgId ? ` (org ${orgId})` : ''}, valid ${days} day(s).
Send it as:  Authorization: Bearer <token>

  ${JWT}

NOTE: this token cannot be revoked. It verifies on its own signature, so it
stays valid until it expires even if the account is disabled. The only way to
kill it early is to change JWT_SECRET, which logs out everyone.
`)
    return
  }

  const { token, expiresAt } = await createSession({
    userId,
    orgId,
    sessionId: user.sessionId ?? nanoid(16),
    lifetimeMinutes: days * MINUTES_PER_DAY,
  })

  console.log(`
Session token for "${username}"${orgId ? ` (org ${orgId})` : ''}.
Expires ${expiresAt.toISOString()} (${days} day(s)).
Send it on every request as:  Cookie: refresh=<token>

  ${token}

This is shown ONCE -- only its hash is stored, so it cannot be retrieved again.
The server treats a missing access token like an expired one, so it will mint
and return access tokens automatically; the client needs no login step.

To revoke, delete this session's row:
  DELETE FROM user_session WHERE token_hash = encode(sha256('<token>'), 'hex');
or revoke every session for the account:
  DELETE FROM user_session WHERE user_id = ${userId};
`)
}

if (process.argv[2] === '--token') {
  console.log(`Conforma ${config.version}`)
  issueToken()
    .then(() => process.exit(0))
    .catch((err) => {
      console.log('ERROR:', errorMessage(err))
      process.exit(1)
    })
}
