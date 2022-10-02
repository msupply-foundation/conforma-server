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

type FormatDate =
  | string
  | {
      format: string
      locale?: string
    }

// Returns ISO date string or JS Date as formatted Date (Luxon). Returns current
// date if date not supplied
const getFormattedDate = (formatString: FormatDate, inputDate?: string | Date) => {
  const date = inputDate
    ? typeof inputDate === 'string'
      ? DateTime.fromISO(inputDate)
      : DateTime.fromJSDate(inputDate)
    : DateTime.now()

  if (typeof formatString === 'string') return date.toFormat(formatString)
  const { format, locale } = formatString
  return date.toFormat(format, { locale })
}

// Returns JS Date object from ISO date string. Returns current timestamp if
// no parameter supplied
const getJSDate = (date?: string) => (date ? DateTime.fromISO(date).toJSDate() : new Date())

// Returns ISO date-time string from JS Date object. Returns current timestamp
// if no parameter supplied
const getISODate = (date?: Date) =>
  date ? DateTime.fromJSDate(date).toISO() : DateTime.now().toISO()

// Extracts any numeric content from a string
export const extractNumber = (input: string) => {
  const numberMatch = input.match(/((\d+\.\d+))|(((?<!\.)\.\d+))|\d+/gm)
  if (!numberMatch) return 0
  return Number(numberMatch[0])
}

export default { generateExpiry, getYear, getFormattedDate, getJSDate, getISODate, extractNumber }
