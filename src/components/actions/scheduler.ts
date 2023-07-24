import DBConnect from '../databaseConnect'
import Scheduler, { RecurrenceRule, RecurrenceSpecObjLit } from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'
import cleanUpFiles from '../files/cleanup'
import createBackup from '../exportAndImport/backup'
import archiveFiles from '../files/archive'
import { ScheduleObject } from '../../types'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds

// Launch schedulers
Scheduler.scheduleJob(
  getSchedule('action', schedulerTestMode, config.actionSchedule ?? config?.hoursSchedule),
  () => {
    triggerScheduledActions()
  }
)
Scheduler.scheduleJob(
  getSchedule('cleanup', schedulerTestMode, config?.previewDocsCleanupSchedule) as RecurrenceRule,
  () => {
    cleanUpFiles()
  }
)
Scheduler.scheduleJob(
  getSchedule('backup', schedulerTestMode, config?.backupSchedule) as RecurrenceRule,
  () => {
    startBackup()
  }
)
Scheduler.scheduleJob(
  getSchedule('archive', schedulerTestMode, config?.archiveSchedule) as RecurrenceRule,
  () => {
    archiveFiles()
  }
)

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}

const startBackup = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Starting backup...'
  )
  createBackup(process.env.BACKUPS_PASSWORD)
}

type ScheduleType = 'action' | 'cleanup' | 'backup' | 'archive'

function getSchedule(
  type: 'action' | 'cleanup' | 'backup' | 'archive',
  testMode: boolean,
  schedule?: number[] | ScheduleObject | RecurrenceSpecObjLit
): RecurrenceSpecObjLit {
  if (testMode) {
    // Run each of these 30secs apart, on a 2-minute overall cycle
    switch (type) {
      case 'action':
        return { second: [0], minute: new Scheduler.Range(0, 58, 2) }
      case 'cleanup':
        return { second: [30], minute: new Scheduler.Range(0, 58, 2) }
      case 'backup':
        return { second: [0], minute: new Scheduler.Range(1, 59, 2) }
      case 'archive':
        return { second: [30], minute: new Scheduler.Range(1, 59, 2) }
    }
  }

  const defaultSchedules: { [K in ScheduleType]: RecurrenceSpecObjLit } = {
    action: {
      // Every hour on the hour
      hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      minute: 0,
    },
    cleanup: {
      // Once per day at 1:05am UTC
      hour: [1],
      minute: 5,
      tz: 'Etc/UTC',
    },
    backup: {
      // Once per day at 1:15am UTC
      hour: [1],
      minute: 15,
      tz: 'Etc/UTC',
    },
    archive: {
      // Twice per week on Weds/Sun at 1:10am UTC
      hour: [1],
      minute: 15,
      tz: 'Etc/UTC',
    },
  }

  const defaultSchedule = defaultSchedules[type]

  if (!schedule) return defaultSchedule

  if (Array.isArray(schedule))
    return {
      ...defaultSchedule,
      hour: schedule,
      minute: 0,
    }

  const combinedSchedule: RecurrenceSpecObjLit = {
    ...defaultSchedule,
    ...schedule,
  } as RecurrenceSpecObjLit

  Object.entries(combinedSchedule).forEach(([key, val]) => {
    // Remove "null" values -- assigning them null is the only way to override
    // the default schedule properties, and setting them to "undefined" isn't
    // enough for node-schedule to revert to defaults
    if (val === null) delete (combinedSchedule as any)[key]
  })

  return combinedSchedule
}
