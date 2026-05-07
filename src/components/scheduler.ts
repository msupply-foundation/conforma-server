import DBConnect from './database/databaseConnect'
import Scheduler, { RecurrenceRule, RecurrenceSpecObjLit } from 'node-schedule'
import config from '../config'
import { DateTime, Settings } from 'luxon'
import cleanUpFiles from './files/cleanup'
import createBackup from './exportAndImport/backup'
import archiveFiles from './files/archive'
import cleanupStaleApplications from './other/staleApplicationCleanup'
import { ScheduleObject } from '../types'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds

// These can be overridden in "ServerPreferences"
const defaultSchedules: { [K in ScheduleType]: RecurrenceSpecObjLit } = {
  action: {
    // Every hour on the hour
    hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    minute: 0,
  },
  fileCleanup: {
    // Once per day at 1:05am
    hour: 1,
    minute: 5,
  },
  backup: {
    // Once per day at 1:15am
    hour: 1,
    minute: 15,
  },
  archive: {
    // Twice per week on Weds/Sun at 1:10am
    dayOfWeek: [0, 3],
    hour: 1,
    minute: 10,
  },
  staleApplicationCleanup: {
    // Once per day at 1:30am
    hour: 1,
    minute: 30,
  },
}

type ScheduleType = 'action' | 'fileCleanup' | 'backup' | 'archive' | 'staleApplicationCleanup'
type UnknownFunction = (...args: never[]) => unknown | void | Promise<void>

export class Schedulers {
  private actionSchedule?: Scheduler.Job
  private fileCleanupSchedule?: Scheduler.Job
  private backupSchedule?: Scheduler.Job
  private archiveSchedule?: Scheduler.Job
  private staleApplicationCleanupSchedule?: Scheduler.Job
  private manualScheduleTimers: Record<string, NodeJS.Timeout>
  constructor() {
    if (schedulerTestMode)
      console.log('Scheduler in test mode, will run a scheduled event every 30 seconds...')

    const actionScheduleRule = getSchedule(
      'action',
      schedulerTestMode,
      config.actionSchedule ?? config?.hoursSchedule
    )
    if (actionScheduleRule) {
      this.actionSchedule = Scheduler.scheduleJob(actionScheduleRule, triggerScheduledActions)
    }

    const fileCleanupScheduleRule = getSchedule(
      'fileCleanup',
      schedulerTestMode,
      config?.fileCleanupSchedule
    )
    if (fileCleanupScheduleRule) {
      this.fileCleanupSchedule = Scheduler.scheduleJob(
        fileCleanupScheduleRule as RecurrenceRule,
        cleanUpFiles
      )
    }

    const backupScheduleRule = getSchedule('backup', schedulerTestMode, config?.backupSchedule)
    if (backupScheduleRule) {
      this.backupSchedule = Scheduler.scheduleJob(backupScheduleRule as RecurrenceRule, () => {
        if (config.skipBackup) {
          console.log('Skipping automatic backup')
          return
        }
        createBackup(process.env.BACKUPS_PASSWORD)
      })
    }

    const archiveScheduleRule = getSchedule('archive', schedulerTestMode, config?.archiveSchedule)
    if (archiveScheduleRule) {
      this.archiveSchedule = Scheduler.scheduleJob(archiveScheduleRule as RecurrenceRule, () =>
        archiveFiles()
      )
    }

    const staleApplicationCleanupScheduleRule = getSchedule(
      'staleApplicationCleanup',
      schedulerTestMode,
      config?.staleApplicationsCleanupSchedule
    )
    if (staleApplicationCleanupScheduleRule) {
      this.staleApplicationCleanupSchedule = Scheduler.scheduleJob(
        staleApplicationCleanupScheduleRule as RecurrenceRule,
        cleanupStaleApplications
      )
    }

    this.manualScheduleTimers = {}

    console.log('\nScheduled jobs started:')
    logNextAction(this.actionSchedule, 'action')
    logNextAction(this.fileCleanupSchedule, 'fileCleanup')
    logNextAction(this.backupSchedule, 'backup')
    logNextAction(this.archiveSchedule, 'archive')
    logNextAction(this.staleApplicationCleanupSchedule, 'staleApplicationCleanup')
  }

  private updateSchedule(
    type: ScheduleType,
    scheduleRule: RecurrenceSpecObjLit | null,
    currentJob: Scheduler.Job | undefined,
    jobFunction: () => unknown
  ): { job: Scheduler.Job | undefined; updated: boolean } {
    // Case 1: No schedule rule and job exists -> cancel
    if (!scheduleRule && currentJob) {
      currentJob.cancel()
      console.log(`${type} schedule cancelled (set to null)`)
      return { job: undefined, updated: true }
    }

    // Case 2: Schedule rule exists and no job -> create new
    if (scheduleRule && !currentJob) {
      const newJob = Scheduler.scheduleJob(scheduleRule as RecurrenceRule, jobFunction)
      return { job: newJob, updated: true }
    }

    // Case 3: Schedule rule exists and job exists -> reschedule
    if (scheduleRule && currentJob) {
      const result = currentJob.reschedule(scheduleRule as RecurrenceRule)
      return { job: currentJob, updated: result }
    }

    // No change needed
    return { job: currentJob, updated: false }
  }

  public reschedule(
    type: ScheduleType,
    schedule?: number[] | ScheduleObject | RecurrenceSpecObjLit
  ) {
    const scheduleRule = getSchedule(type, false, schedule)
    let result: { job: Scheduler.Job | undefined; updated: boolean }

    switch (type) {
      case 'action':
        result = this.updateSchedule(
          type,
          scheduleRule,
          this.actionSchedule,
          triggerScheduledActions
        )
        this.actionSchedule = result.job
        break
      case 'fileCleanup':
        result = this.updateSchedule(type, scheduleRule, this.fileCleanupSchedule, cleanUpFiles)
        this.fileCleanupSchedule = result.job
        break
      case 'backup':
        result = this.updateSchedule(type, scheduleRule, this.backupSchedule, () => {
          if (config.skipBackup) {
            console.log('Skipping automatic backup')
            return
          }
          createBackup(process.env.BACKUPS_PASSWORD)
        })
        this.backupSchedule = result.job
        break
      case 'archive':
        result = this.updateSchedule(type, scheduleRule, this.archiveSchedule, () => archiveFiles())
        this.archiveSchedule = result.job
        break
      case 'staleApplicationCleanup':
        result = this.updateSchedule(
          type,
          scheduleRule,
          this.staleApplicationCleanupSchedule,
          cleanupStaleApplications
        )
        this.staleApplicationCleanupSchedule = result.job
        break
    }

    if (result.updated && result.job) logNextAction(result.job, type)
    else if (!result.updated && scheduleRule) console.log(`Problem updating ${type} schedule!`)
  }

  public manuallySchedule = async (
    run: ScheduleType | UnknownFunction,
    time: number, // minutes
    cancelPrevious: boolean = true
  ) => {
    let method: UnknownFunction

    switch (run) {
      case 'action':
        method = triggerScheduledActions
        break
      case 'archive':
        method = archiveFiles
        break
      case 'fileCleanup':
        method = cleanUpFiles
        break
      case 'backup':
        method = createBackup // Not encrypted
        break
      case 'staleApplicationCleanup':
        method = cleanupStaleApplications
        break
      default:
        method = run
    }

    const scheduleMessage = `Manually scheduling ${
      typeof run === 'function' ? 'Custom function' : run.toUpperCase()
    } for ${time} minutes time`

    const executionMessage = `Executing scheduled ${
      typeof run === 'function' ? 'Custom function' : run.toUpperCase()
    }`

    if (!cancelPrevious) {
      console.log(scheduleMessage)
      setTimeout(() => {
        console.log(executionMessage)
        method()
      }, time * 60_000)
      return
    }

    const timerKey = typeof run === 'function' ? run.toString() : run
    if (this.manualScheduleTimers[timerKey]) {
      console.log(
        `Cancelling previously scheduled ${
          typeof run === 'function' ? 'Custom function' : run.toUpperCase()
        }`
      )
      clearTimeout(this.manualScheduleTimers[timerKey])
    }

    console.log(scheduleMessage)
    this.manualScheduleTimers[timerKey] = setTimeout(() => {
      console.log(executionMessage)
      method()
    }, time * 60_000)
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
  schedule?: number[] | ScheduleObject | RecurrenceSpecObjLit | null
): RecurrenceSpecObjLit | null {
  // Explicitly null means "never run"
  if (schedule === null) return null

  if (testMode) {
    // Run each of these 30secs apart, on a 3-minute overall cycle
    switch (type) {
      case 'action':
        return { second: [0], minute: new Scheduler.Range(0, 57, 3) }
      case 'fileCleanup':
        return { second: [30], minute: new Scheduler.Range(0, 57, 3) }
      case 'backup':
        return { second: [0], minute: new Scheduler.Range(1, 58, 3) }
      case 'archive':
        return { second: [30], minute: new Scheduler.Range(1, 58, 3) }
      case 'staleApplicationCleanup':
        return { second: [0], minute: new Scheduler.Range(2, 59, 3) }
    }
  }

  // We need to insert default timezone here rather than in the above default
  // definitions, as the "defaultZoneName" hasn't been loaded into Settings when
  // those are initially loaded.
  const defaultSchedule = { ...defaultSchedules[type], tz: Settings.defaultZoneName }

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

function logNextAction(scheduler: Scheduler.Job | undefined, name: ScheduleType) {
  if (!scheduler) {
    console.log(`Next ${name} schedule: DISABLED`)
    return
  }
  // @ts-ignore -- the type of nextInvocation result is wrong, it's typed as Date but it's actually a "CronDate"
  const nextSchedule = scheduler.nextInvocation().toDate() as Date
  console.log(
    `Next ${name} schedule: ${DateTime.fromJSDate(nextSchedule).toLocaleString(
      DateTime.DATETIME_SHORT_WITH_SECONDS
    )}`
  )
}
