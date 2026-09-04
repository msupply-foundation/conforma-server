import { DateTime, Settings } from 'luxon'
import { serverPrefKeys, ServerPreferences, WebAppPrefs, Config } from './types'
import { readJsonSync } from 'fs-extra'
import path from 'path'
import { getAppEntryPointDir } from './components/utilityFunctions'
import { merge } from 'lodash'
import databaseConnect from './components/database/databaseConnect'
import { warnAboutPlaintextSecrets } from './components/external-apis/warnPlaintextSecrets'

function loadPrefs(preferencesFolder: string, preferencesFileName: string) {
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

function getIsLiveServer(webHostUrl: string | undefined, productionHost?: string | null) {
  if (!webHostUrl) return false
  if (!productionHost) return true

  const re = new RegExp(`^https?:\/\/${productionHost}.*`)
  return re.test(webHostUrl)
}

function getEmailOperationMode(
  emailTestMode: boolean | undefined,
  testingEmail: string | string[] | undefined,
  isLiveServer: boolean
): 'LIVE' | 'TEST' | 'NONE' {
  // An empty array is truthy, so must be checked explicitly
  const hasTestingEmail = Array.isArray(testingEmail) ? testingEmail.length > 0 : !!testingEmail
  switch (true) {
    case emailTestMode === false:
      return 'LIVE'
    case emailTestMode === true && hasTestingEmail:
      return 'TEST'
    case isLiveServer:
      return 'LIVE'
    case hasTestingEmail:
      return 'TEST'
    default:
      return 'NONE'
  }
}

// Mutate the global config object to inject new preferences
export const refreshConfig = async (config: Config) => {
  console.log('\nUpdating system configuration...')
  const prefs = loadPrefs(config.preferencesFolder, config.preferencesFileName)
  const serverPrefs: ServerPreferences = prefs.server
  const webAppPrefs: WebAppPrefs = prefs.web
  serverPrefKeys.forEach((key) => {
    if (serverPrefs[key] !== undefined) {
      config[key] = serverPrefs[key] as never
    } else delete config[key]
  })

  warnAboutPlaintextSecrets(config.externalApiConfigs)

  if (webAppPrefs.siteHost) config.productionHost = webAppPrefs.siteHost
  else config.productionHost = undefined

  config.isLiveServer = getIsLiveServer(config.webHostUrl, webAppPrefs.siteHost)
  config.emailMode = getEmailOperationMode(
    serverPrefs.emailTestMode,
    serverPrefs.testingEmail,
    config.isLiveServer
  )
  config.latestSnapshot = await databaseConnect.getSystemInfo('snapshot')

  // Update locale and timezone if changed
  const newLocale = serverPrefs.locale ?? Intl.DateTimeFormat().resolvedOptions().locale
  if (newLocale !== Settings.defaultLocale) {
    console.log(`Changing locale to: ${newLocale}`)
    Settings.defaultLocale = newLocale
  }

  const newTimezone = serverPrefs?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  if (newTimezone !== Settings.defaultZoneName) {
    console.log(`Changing timezone to: ${newTimezone}`)
    Settings.defaultZoneName = newTimezone
  }

  //Update scheduled jobs from prefs
  if (config.scheduledJobs) {
    config.scheduledJobs.reschedule('action', serverPrefs.actionSchedule)
    config.scheduledJobs.reschedule('backup', serverPrefs.backupSchedule)
    config.scheduledJobs.reschedule('fileCleanup', serverPrefs.fileCleanupSchedule)
    config.scheduledJobs.reschedule('archive', serverPrefs.archiveSchedule)
    config.scheduledJobs.reschedule(
      'staleApplicationCleanup',
      serverPrefs.staleApplicationsCleanupSchedule
    )
  }

  console.log('Email mode:', config.emailMode)
  if (config.emailMode === 'TEST') console.log('All Email sent to:', config.testingEmail)
  console.log('Current time:', DateTime.now().toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS))
  console.log('Configuration refreshed with updated preferences\n')
}
