require('dotenv').config()
import preferences from '../preferences/preferences.json'
import { readFileSync } from 'fs'
import { version } from '../package.json'
import { serverPrefKeys, ServerPreferences, WebAppPrefs } from './types'
const serverPrefs: ServerPreferences = preferences.server
const isProductionBuild = process.env.NODE_ENV === 'production'
const siteHost = (preferences.web as WebAppPrefs)?.siteHost
const webHostUrl = process.env.WEB_HOST
const isLiveServer = getIsLiveServer(webHostUrl, siteHost)

// Change to true to force email server to use local Mailhog
const USE_MAIL_HOG = false

export type EmailOperationMode = 'LIVE' | 'TEST' | 'NONE' | 'MAILHOG'
/*
Operation modes:

- LIVE: Emails are sent normally according to action configurations
- TEST: All emails are sent to a single address, defined in server
  preferences "testingEmail" property. Used on testing servers or in
  development.
- NONE: No emails are sent at all. Used for automated testing, or when a
  "testingEmail" address is not provided.
- MAILHOG: All emails are relayed through a local MailHog SMTP server (so not
  actually sent). An alternative development mode.
*/

const config = {
  pg_database_connection: {
    user: 'postgres',
    host: 'localhost',
    database: 'tmf_app_manager',
    password: '',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
  },
  version,
  // In production postgraphile is started with -q and -i /postgraphile/...
  graphQLendpoint: isProductionBuild
    ? 'http://localhost:5000/postgraphile/graphql'
    : 'http://localhost:5000/graphql',
  // 'Folder path from perspective of server.ts/js'
  filesFolder: '../files',
  pluginsFolder: '../plugins',
  imagesFolder: '../images',
  databaseFolder: '../database',
  localisationsFolder: '../localisation',
  preferencesFolder: '../preferences',
  preferencesFileName: 'preferences.json',
  backupsFolder: '../backups',
  genericThumbnailsFolderName: '_generic_thumbnails',
  // In production postgraphile is started with -q and -i /postgraphile/...
  nodeModulesFolder:
    process.env.NODE_ENV === 'production' ? '../../node_modules' : '../node_modules',
  jwtSecret: process.env.JWT_SECRET || 'devsecret',
  RESTport: 8080,
  dataTablePrefix: 'data_table_', // snake_case
  // These are the only default tables in the system that we allow to be mutated
  // directly by modifyRecord or display as data views. All other names must
  // have "data_table_" prepended.
  allowedTableNames: ['user', 'organisation', 'application', 'file'],
  // From the above allowed tables, these ones can be written to, but can't have
  // columns added (i.e. schema changes):
  allowedTablesNoColumns: ['application', 'file'],
  filterListMaxLength: 10,
  filterListBatchSize: 1000,
  filterColumnSuffix: '_filter_data', // snake_case,
  isProductionBuild,
  defaultSystemManagerPermissionName: 'systemManager',
  ...serverPrefs,
  webHostUrl,
  productionHost: siteHost,
  isLiveServer,
  emailMode: getEmailOperationMode(serverPrefs.emailTestMode, serverPrefs.testingEmail),
}

// Mutate the active config object to inject new preferences
type Config = typeof config
export const refreshConfig = (config: Config, prefsFilePath: string) => {
  // prefsFilePath is passed in rather than imported from constants to prevent
  // circular reference
  const prefs = JSON.parse(readFileSync(prefsFilePath, 'utf-8'))
  const serverPrefs: ServerPreferences = prefs.server
  const webAppPrefs: WebAppPrefs = prefs.web
  serverPrefKeys.forEach((key) => {
    if (serverPrefs[key] !== undefined) {
      config[key] = serverPrefs[key] as never
    } else delete config[key]
  })

  if (webAppPrefs.siteHost) config.productionHost = webAppPrefs.siteHost
  else config.productionHost = undefined

  config.isLiveServer = getIsLiveServer(webHostUrl, webAppPrefs.siteHost)
  config.emailMode = getEmailOperationMode(serverPrefs.emailTestMode, serverPrefs.testingEmail)

  console.log('\nConfiguration refreshed with updated preferences')
  console.log('Email mode:', config.emailMode)
  if (config.emailMode === 'TEST') console.log('Email sent to:', config.testingEmail)
}

function getIsLiveServer(webHostUrl: string | undefined, productionHost?: string | null) {
  if (!webHostUrl) return false
  if (!productionHost) return true

  const re = new RegExp(`^https?:\/\/${productionHost}.*`)
  return re.test(webHostUrl)
}

function getEmailOperationMode(
  emailTestMode: boolean | undefined,
  testingEmail: string | undefined
): EmailOperationMode {
  switch (true) {
    case emailTestMode === false:
      return 'LIVE'
    case emailTestMode === true && !!testingEmail:
      return 'TEST'
    case USE_MAIL_HOG as boolean:
      return 'MAILHOG'
    case isLiveServer:
      return 'LIVE'
    case !!testingEmail:
      return 'TEST'
    default:
      return 'NONE'
  }
}

export default config
