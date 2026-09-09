import Scheduler, { RecurrenceSpecObjLit } from 'node-schedule'
import { Settings } from 'luxon'
import { ScheduleObject } from '../types'

export type ScheduleType =
  | 'action'
  | 'fileCleanup'
  | 'backup'
  | 'archive'
  | 'staleApplicationCleanup'

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

// Scheduled actions have to keep running for the system to work, so unlike the
// other jobs the action schedule can't be switched off: a missing schedule
// falls back to the deprecated hoursSchedule, and then to the default (hourly).
// The preference isn't typed as nullable, but a null can still arrive from
// preferences.json, and it must not stop the job -- hence the "??" chain, and
// the trailing "?? undefined" so a null can never reach getSchedule (which
// would read it as "never run").
export function getActionSchedulePref(prefs: {
  actionSchedule?: number[] | ScheduleObject | null
  hoursSchedule?: number[] | null
}) {
  return prefs.actionSchedule ?? prefs.hoursSchedule ?? undefined
}

// Turns a schedule preference into a node-schedule recurrence rule, or null if
// the job shouldn't be scheduled at all
export function getSchedule(
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
