require('dotenv').config()
import { version } from '../package.json'
import { ServerPreferences, WebAppPrefs, Config } from './types'
import { EventThrottle } from './components/actions/throttle'
import PostgresConfig from './components/database/postgresConfig.json'
import { readJsonSync } from 'fs-extra'
import path from 'path'
import { getAppEntryPointDir } from './components/utilityFunctions'
import { merge } from 'lodash'

const preferencesFolder = '../preferences'
const preferencesFileName = 'preferences.json'

// Shared by every developer, and published in this repo -- see
// resolveJwtSecret() for what that costs and where it is refused.
const DEV_JWT_SECRET = 'devsecret'

const preferences = loadPrefs()

const serverPrefs: ServerPreferences = preferences.server as ServerPreferences
const isProductionBuild = process.env.NODE_ENV === 'production'
const siteHost = (preferences.web as WebAppPrefs)?.siteHost
const webHostUrl = process.env.WEB_HOST
const isLiveServer = getIsLiveServer(webHostUrl, siteHost)

// Opt-in for testing the app on other devices over a LAN address, which
// requires dropping the auth cookies' "Secure" flag -- see
// components/permissions/sessionCookies.ts for why.
//
// A production build and a live server each refuse it, and between them they
// cover a deployment however it was launched. isProductionBuild alone would
// not: NODE_ENV=production is set only by the Docker entrypoint, while
// `yarn serve` copies the developer's .env into the build, so the flag can
// travel to a deployment that never sets it. isLiveServer is derived from
// WEB_HOST matching the configured siteHost -- deployment topology rather
// than a variable someone has to remember.
//
// A test run refuses it too, since the suite asserts the full flag set and a
// developer who leaves this in their .env must not see those assertions
// quietly change.
const allowInsecureCookies =
  process.env.INSECURE_COOKIES_FOR_LAN_TESTING === 'true' &&
  !isProductionBuild &&
  !isLiveServer &&
  process.env.NODE_ENV !== 'test'

// Change to true to force email server to use local Mailhog
const USE_MAIL_HOG = false

console.log('isProductionBuild', isProductionBuild)

export type EmailOperationMode = 'LIVE' | 'TEST' | 'NONE' | 'MAILHOG'
/*
Operation modes:

- LIVE: Emails are sent normally according to action configurations
- TEST: All emails are sent to the address (or array of addresses) defined
  in server preferences "testingEmail" property. Used on testing servers or
  in development.
- NONE: No emails are sent at all. Used for automated testing, or when a
  "testingEmail" address is not provided.
- MAILHOG: All emails are relayed through a local MailHog SMTP server (so not
  actually sent). An alternative development mode.
*/

// Global Throttle instance, for spacing out processing when (potentially)
// several hundred events occur simultaneously, or for making sure a particular
// function waits till an existing (throttled) event is complete
const Throttle = new EventThrottle()

// Global config object
const config: Config = {
  pg_database_connection: PostgresConfig,
  version,
  graphQLendpoint: 'http://localhost:8080/graphql',
  // 'Folder path from perspective of server.ts/js'
  filesFolder: '../files',
  pluginsFolder: '../plugins',
  imagesFolder: '../images',
  databaseFolder: '../database',
  localisationsFolder: '../localisation',
  zipCacheFolder: '../__zip_cache',
  typstCacheFolder: '../__typst_cache',
  fontsFolder: '../fonts',
  stagedDownloadsFolder: '../__staged_downloads',
  preferencesFolder,
  preferencesFileName,
  backupsFolder: '../backups',
  genericThumbnailsFolderName: '_generic_thumbnails',
  defaultUnderMaintenanceSite: 'https://msupply.foundation/projects/conforma',
  // In production postgraphile is started with -q and -i /postgraphile/...
  nodeModulesFolder:
    process.env.NODE_ENV === 'production' ? '../../node_modules' : '../node_modules',
  jwtSecret: resolveJwtSecret(),
  RESTport: 8080,
  dataTablePrefix: 'data_table_', // snake_case
  // These are the only default tables in the system that we allow to be mutated
  // directly by modifyRecord or display as data views. All other names must
  // have "data_table_" prepended.
  allowedTableNames: ['user', 'organisation', 'application', 'file', 'data_changelog'],
  // From the above allowed tables, these ones can be written to, but can't have
  // columns added (i.e. schema changes):
  allowedTablesNoColumns: ['application', 'file'],
  filterListMaxLength: 10,
  filterListBatchSize: 1000,
  filterColumnSuffix: '_filter_data', // snake_case,
  fileUploadLimit: 5 * 1024 * 1024 * 1024, // 5GB
  isProductionBuild,
  allowInsecureCookies,
  defaultSystemManagerPermissionName: 'systemManager',
  ...serverPrefs,
  webHostUrl,
  productionHost: siteHost,
  isLiveServer,
  emailMode: getEmailOperationMode(serverPrefs.emailTestMode, serverPrefs.testingEmail),
  maintenanceMode: false,
  Throttle,
}

function loadPrefs() {
  const mainPrefs = readJsonSync(
    path.join(getAppEntryPointDir(), preferencesFolder, preferencesFileName)
  )
  if (process.env.PREFERENCE_OVERRIDES) {
    try {
      const overridePrefs = readJsonSync(process.env.PREFERENCE_OVERRIDES)
      console.log('PREFERENCE_OVERRIDES found:')
      console.log(JSON.stringify(overridePrefs, null, 2))
      return merge(mainPrefs, overridePrefs)
    } catch {
      console.log(
        `ERROR: Unable to load file specified in PREFERENCE_OVERRIDES: ${process.env.PREFERENCE_OVERRIDES}`
      )
      return mainPrefs
    }
  } else return mainPrefs
}

// The only place the JWT secret is resolved: postgraphile.ts verifies tokens
// that loginHelpers.ts signed, so a second reading of the environment could
// disagree with this one and reject every token the REST tier issued.
//
// DEV_JWT_SECRET is public, so a token signed with it can be forged --
// including one with isAdmin set, which carries role 'postgres' and bypasses
// every row-level policy. A production build therefore refuses to start
// without a real secret -- in any entry point that loads this file, including
// the snapshot CLI docker/entry.sh runs to seed a fresh install.
//
// Any other launch keeps the development fallback, which fixtures, the test
// suite and a nodemon reload all rely on being stable, but says so on every
// startup: `yarn serve` can deploy a build that never sets NODE_ENV, and that
// deployment has to be told rather than quietly trusted.
//
// A blank or whitespace-only value counts as unset, which catches both
// `JWT_SECRET=` in an .env file and an unset `${JWT_SECRET}` passed through
// docker-compose.
function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim()
  if (secret) return secret

  if (isProductionBuild) {
    console.error(
      'ERROR!\nThe JWT_SECRET environment variable is not set. Conforma ' +
        "won't start without it -- the development fallback is public, so any " +
        'token signed with it can be forged.\n\nExiting now...\n'
    )
    process.exit(1)
  }

  if (process.env.NODE_ENV !== 'test')
    console.warn(`
!! WARNING ------------------------------------------------------------------
!! JWT_SECRET is not set, so the public "${DEV_JWT_SECRET}" fallback is in use.
!! Any token signed with it can be forged, including an admin one, which runs
!! as the Postgres superuser. Set JWT_SECRET before this server is reachable
!! from a network.
!! ---------------------------------------------------------------------------`)

  return DEV_JWT_SECRET
}

function getIsLiveServer(webHostUrl: string | undefined, productionHost?: string | null) {
  if (!webHostUrl) return false
  if (!productionHost) return true

  const re = new RegExp(`^https?:\/\/${productionHost}.*`)
  return re.test(webHostUrl)
}

function getEmailOperationMode(
  emailTestMode: boolean | undefined,
  testingEmail: string | string[] | undefined
): EmailOperationMode {
  // An empty array is truthy, so must be checked explicitly
  const hasTestingEmail = Array.isArray(testingEmail) ? testingEmail.length > 0 : !!testingEmail
  switch (true) {
    case emailTestMode === false:
      return 'LIVE'
    case emailTestMode === true && hasTestingEmail:
      return 'TEST'
    case USE_MAIL_HOG as boolean:
      return 'MAILHOG'
    case isLiveServer:
      return 'LIVE'
    case hasTestingEmail:
      return 'TEST'
    default:
      return 'NONE'
  }
}

export default config
