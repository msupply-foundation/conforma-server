import { getActionSchedulePref, getSchedule } from './scheduleRules'

// Scheduled actions must always be scheduled -- there is deliberately no way to
// switch the job off, so every one of these must produce a usable rule
describe('getActionSchedulePref', () => {
  it('uses actionSchedule when it is set', () => {
    expect(getActionSchedulePref({ actionSchedule: { hour: 6 }, hoursSchedule: [1] })).toEqual({
      hour: 6,
    })
  })

  it('falls back to the deprecated hoursSchedule when actionSchedule is absent', () => {
    expect(getActionSchedulePref({ hoursSchedule: [1, 2, 3] })).toEqual([1, 2, 3])
  })

  it('falls back to hoursSchedule when actionSchedule is null, rather than stopping the job', () => {
    expect(getActionSchedulePref({ actionSchedule: null, hoursSchedule: [1, 2, 3] })).toEqual([
      1, 2, 3,
    ])
  })

  it('never returns null, so getSchedule cannot read it as "never run"', () => {
    // A null can arrive from preferences.json even though the type disallows it
    expect(getActionSchedulePref({ actionSchedule: null })).toBeUndefined()
    expect(getActionSchedulePref({ actionSchedule: null, hoursSchedule: null })).toBeUndefined()
  })

  it('still schedules the action job for every combination of the two preferences', () => {
    const combinations = [
      {},
      { actionSchedule: null },
      { actionSchedule: null, hoursSchedule: null },
      { actionSchedule: null, hoursSchedule: [1, 2, 3] },
      { hoursSchedule: [1, 2, 3] },
      { actionSchedule: { hour: 6 } },
    ]

    combinations.forEach((prefs) => {
      expect(getSchedule('action', false, getActionSchedulePref(prefs))).not.toBeNull()
    })
  })
})
