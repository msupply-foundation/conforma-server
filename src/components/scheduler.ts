import DBConnect from './databaseConnect'
import Scheduler, { RecurrenceRule, RecurrenceSpecObjLit } from 'node-schedule'
import config from '../config'
import { DateTime, Settings } from 'luxon'
import cleanUpFiles from './files/cleanup'
import createBackup from './exportAndImport/backup'
import archiveFiles from './files/archive'
import { ScheduleObject } from '../types'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds

// These can be overridden in "ServerPreferences"
const defaultSchedules: { [K in ScheduleType]: RecurrenceSpecObjLit } = {
  action: {
    // Every hour on the hour
    hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    minute: 0,
    tz: Settings.defaultZoneName,
  },
  cleanup: {
    // Once per day at 1:05am
    hour: 1,
    minute: 5,
    tz: Settings.defaultZoneName,
  },
  backup: {
    // Once per day at 1:15am
    hour: 1,
    minute: 15,
    tz: Settings.defaultZoneName,
  },
  archive: {
    // Twice per week on Weds/Sun at 1:10am
    dayOfWeek: [0, 3],
    hour: 1,
    minute: 15,
    tz: Settings.defaultZoneName,
  },
}

type ScheduleType = 'action' | 'cleanup' | 'backup' | 'archive'

export class Schedulers {
  private actionSchedule: Scheduler.Job
  private cleanupSchedule: Scheduler.Job
  private backupSchedule: Scheduler.Job
  private archiveSchedule: Scheduler.Job
  constructor() {
    this.actionSchedule = Scheduler.scheduleJob(
      getSchedule('action', schedulerTestMode, config.actionSchedule ?? config?.hoursSchedule),
      () => triggerScheduledActions()
    )
    this.cleanupSchedule = Scheduler.scheduleJob(
      getSchedule('cleanup', schedulerTestMode, config?.fileCleanupSchedule) as RecurrenceRule,
      () => cleanUpFiles()
    )
    this.backupSchedule = Scheduler.scheduleJob(
      getSchedule('backup', schedulerTestMode, config?.backupSchedule) as RecurrenceRule,
      () => createBackup(process.env.BACKUPS_PASSWORD)
    )
    this.archiveSchedule = Scheduler.scheduleJob(
      getSchedule('archive', schedulerTestMode, config?.archiveSchedule) as RecurrenceRule,
      () => archiveFiles()
    )

    console.log('\nScheduled jobs started:')
    logNextAction(this.actionSchedule, 'action')
    logNextAction(this.cleanupSchedule, 'cleanup')
    logNextAction(this.backupSchedule, 'backup')
    logNextAction(this.archiveSchedule, 'archive')
  }

  public reschedule(
    type: ScheduleType,
    schedule?: number[] | ScheduleObject | RecurrenceSpecObjLit
  ) {
    let result: boolean
    let scheduler: Scheduler.Job
    switch (type) {
      case 'action':
        result = this.actionSchedule.reschedule(
          getSchedule('action', false, schedule) as RecurrenceRule
        )
        scheduler = this.actionSchedule
        break
      case 'cleanup':
        result = this.cleanupSchedule.reschedule(
          getSchedule('cleanup', false, schedule) as RecurrenceRule
        )
        scheduler = this.cleanupSchedule
        break
      case 'backup':
        result = this.backupSchedule.reschedule(
          getSchedule('backup', false, schedule) as RecurrenceRule
        )
        scheduler = this.backupSchedule
        break
      case 'archive':
        result = this.archiveSchedule.reschedule(
          getSchedule('archive', false, schedule) as RecurrenceRule
        )
        scheduler = this.archiveSchedule
        break
    }
    if (result) logNextAction(scheduler, type)
    else console.log(`Problem updating ${type} schedule!`)
  }
}

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}

function getSchedule(
  type: ScheduleType,
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

function logNextAction(scheduler: Scheduler.Job, name: ScheduleType) {
  // @ts-ignore -- the type of nextInvocation result is wrong, it's typed as Date but it's actually a "CronDate"
  const nextSchedule = scheduler.nextInvocation().toDate() as Date
  console.log(
    `Next ${name} schedule: ${DateTime.fromJSDate(nextSchedule).toLocaleString(
      DateTime.DATETIME_SHORT_WITH_SECONDS
    )}`
  )
}
