/*
Utility functions to extend capabilities of expression evaluator via the
"objectFunctions" operator.

Any changes done here should also be replicated in front-end
"evaluatorFunctions.ts"so they can be simulated in the Template Builder.
 */

import { DateTime, Duration } from 'luxon'

const generateExpiry = (duration: Duration) => DateTime.now().plus(duration).toJSDate()

// getYear() => "2022"
// getYear("short") => "22"
const getYear = (type?: 'short'): string =>
  type === 'short' ? String(new Date().getFullYear()).slice(2) : String(new Date().getFullYear())

// Returns ISO date string or JS Date as formatted Date (Luxon). Returns current
// date if date not supplied
const getFormattedDate = (formatString: string, date?: string | Date) =>
  (date
    ? typeof date === 'string'
      ? DateTime.fromISO(date)
      : DateTime.fromJSDate(date)
    : DateTime.now()
  ).toFormat(formatString)

// Returns JS Date object from ISO date string. Returns current timestamp if
// no parameter supplied
const getJSDate = (date?: string) => (date ? DateTime.fromISO(date).toJSDate() : new Date())

// Returns ISO date-time string from JS Date object. Returns current timestamp
// if no parameter supplied
const getISODate = (date?: Date) =>
  date ? DateTime.fromJSDate(date).toISO() : DateTime.now().toISO()

export default { generateExpiry, getYear, getFormattedDate, getJSDate, getISODate }
