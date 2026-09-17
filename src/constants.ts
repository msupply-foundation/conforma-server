import path from 'path'
import { getAppEntryPointDir } from './components/utilityFunctions'
import config from './config'

export const DEFAULT_SNAPSHOT_NAME = 'current'
export const BASE_SNAPSHOT_NAME = 'core_templates'
export const DEFAULT_OPTIONS_NAME = 'default'
export const SNAPSHOT_SUBFOLDER = '_snapshots'
export const SNAPSHOT_FILE_NAME = 'snapshot'
export const ARCHIVE_SUBFOLDER_NAME = '_ARCHIVE'
export const ARCHIVE_TEMP_FOLDER_NAME = '__TEMP_Archives'
export const SNAPSHOT_ARCHIVES_FOLDER_NAME = '_archives'
export const SNAPSHOT_ARCHIVE_STORE_FOLDER_NAME = '_archive_store'
export const OPTIONS_FILE_NAME = 'options'
export const FILES_TEMP_FOLDER_NAME = '__TEMP_Files'
export const INFO_FILE_NAME = 'info'
export const SCHEMA_FILE_NAME = 'schema_init'
export const PREFERENCES_FILE_NAME = config.preferencesFileName
export const DEFAULT_LOGOUT_TIME = 60 // Minutes

// Access tokens are short-lived and silently renewed against the session, so
// their lifetime is a fraction of the inactivity window rather than the whole
// of it -- capped, so that a deployment with a very long window (or none at
// all) still issues tokens that go stale in an hour.
// See kdd/auth-token-lifecycle
export const ACCESS_TOKEN_TIME_DIVISOR = 12
export const MAX_ACCESS_TOKEN_TIME = 60 // Minutes
export const MIN_ACCESS_TOKEN_TIME = 1 // Minutes

// Every hit on a public form URL (bots included) creates a session, and they
// all share one account, so they get a shorter window than staff logins.
export const PUBLIC_SESSION_TIME = 24 * 60 // Minutes (1 day)

// When "logoutAfterInactivity" is 0, auto-logout is disabled, so sessions are
// kept alive indefinitely rather than expiring.
export const NO_EXPIRY_SESSION_TIME = 100 * 365 * 24 * 60 // Minutes (100 years)

// The single shared account behind all public forms (UserRegistration,
// PasswordReset). It is seeded first specifically so that it always gets id 1,
// which the "applyNonRegistered" row-level policy relies on.
export const NON_REGISTERED_USER_ID = 1
export const NON_REGISTERED_USERNAME = 'nonRegistered'

// The system organisation, baked into every snapshot at id 1. The only org id
// that means the same thing in one dataset as it does in another, so the only
// one worth carrying across a database restore.
export const DEFAULT_SYSTEM_ORG_ID = 1

// How often expired sessions are swept and idle clients told their session has
// ended. A fixed internal poll, not a user-editable schedule, so it is a plain
// setInterval rather than a scheduler.ts job. Up to a minute of lag is
// immaterial: an expired session stops working the instant it expires, because
// every lookup filters on expires_at.
export const SESSION_CLEANUP_INTERVAL = 60_000 // Milliseconds

export const DEFAULT_THUMBNAIL_MAX_WIDTH = 300
export const DEFAULT_THUMBNAIL_MAX_HEIGHT = 300

export const MAX_32_BIT_INT = 2_147_483_647

export const ROOT_FOLDER = path.join(getAppEntryPointDir(), '../')
export const DATABASE_FOLDER = path.join(getAppEntryPointDir(), config.databaseFolder)
export const SNAPSHOT_FOLDER = path.join(DATABASE_FOLDER, SNAPSHOT_SUBFOLDER)
export const SNAPSHOT_ARCHIVE_FOLDER = path.join(
  SNAPSHOT_FOLDER,
  SNAPSHOT_ARCHIVE_STORE_FOLDER_NAME
)
export const BACKUPS_FOLDER = path.join(getAppEntryPointDir(), config.backupsFolder)
export const FILES_FOLDER = path.join(getAppEntryPointDir(), config.filesFolder)
export const ARCHIVE_FOLDER = path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME)
export const ZIP_CACHE_FOLDER = path.join(getAppEntryPointDir(), config.zipCacheFolder)
export const TYPST_CACHE_FOLDER = path.join(getAppEntryPointDir(), config.typstCacheFolder)
export const FONTS_FOLDER = path.join(getAppEntryPointDir(), config.fontsFolder)
export const STAGED_DOWNLOAD_FOLDER = path.join(getAppEntryPointDir(), config.stagedDownloadsFolder)
// We want to keep ARCHIVE_TEMP_FOLDER inside FILES_FOLDER so that, when
// dockerised, the archives are "collected" within the same volume. This
// substantially speeds up restoring a large snapshot when most of the required
// archives are already in the current system.
export const ARCHIVE_TEMP_FOLDER = path.join(FILES_FOLDER, ARCHIVE_TEMP_FOLDER_NAME)
export const FILES_TEMP_FOLDER = path.join(FILES_FOLDER, FILES_TEMP_FOLDER_NAME)
export const IMAGES_FOLDER = path.join(getAppEntryPointDir(), config.imagesFolder)
export const LOCALISATION_FOLDER = path.join(getAppEntryPointDir(), config.localisationsFolder)
export const PREFERENCES_FOLDER = path.join(getAppEntryPointDir(), config.preferencesFolder)
export const PREFERENCES_FILE = path.join(PREFERENCES_FOLDER, PREFERENCES_FILE_NAME)
export const GENERIC_THUMBNAILS_SOURCE_FOLDER = path.join(
  getAppEntryPointDir(),
  config.imagesFolder,
  'generic_file_thumbnails'
)
export const GENERIC_THUMBNAILS_FOLDER = path.join(FILES_FOLDER, config.genericThumbnailsFolderName)
export const BASE_SNAPSHOT_FOLDER = path.join(DATABASE_FOLDER, BASE_SNAPSHOT_NAME)
