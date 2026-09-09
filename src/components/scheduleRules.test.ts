import { getActionSchedulePref, getSchedule } from './scheduleRules'

describe('getActionSchedulePref', () => {
  it('never falls back to the deprecated hoursSchedule when actionSchedule is null', () => {
    // Regression test: "??" would return hoursSchedule here, leaving actions
    // running hourly despite having been switched off. The default preferences
    // do set hoursSchedule, so this is the case that actually bites.
    const pref = getActionSchedulePref({ actionSchedule: null, hoursSchedule: [1, 2, 3] })

    expect(pref).toBeNull()
    expect(getSchedule('action', false, pref)).toBeNull()
  })

  it('falls back to the deprecated hoursSchedule when actionSchedule is absent', () => {
    expect(getActionSchedulePref({ hoursSchedule: [1, 2, 3] })).toEqual([1, 2, 3])
  })

  it('prefers actionSchedule when both are set', () => {
    expect(getActionSchedulePref({ actionSchedule: { hour: 6 }, hoursSchedule: [1] })).toEqual({
      hour: 6,
    })
  })

  it('returns undefined when neither is set, so the default schedule is used', () => {
    expect(getActionSchedulePref({})).toBeUndefined()
    expect(getSchedule('action', false, getActionSchedulePref({}))).toMatchObject({
      hour: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
      minute: 0,
    })
  })
})
