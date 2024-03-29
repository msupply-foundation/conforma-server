// This file should be identical to the back-end "evaluatorFunctions.ts". It
// allows us to preview the "objectFunctions" operator in the Template Builder
// Actions config

import { DateTime, Duration } from 'luxon'

interface FilterOptions {
  key?: string
  rule?: 'exclude' | 'include'
  values: string | string[]
}

const filterArray = (valuesArray: unknown[], options: FilterOptions) => {
  const { key, rule = 'exclude', values } = options

  const compareValues = Array.isArray(values) ? values : [values]

  const isObject = (element: unknown) =>
    typeof element === 'object' && !Array.isArray(element) && element !== null

  return valuesArray.filter((element) => {
    if (key && isObject(element))
      return Object.entries(element as Object).find(
        ([objKey, value]) =>
          objKey === key &&
          (rule === 'include' ? compareValues.includes(value) : !compareValues.includes(value))
      )
    else
      return rule === 'include'
        ? compareValues.includes(element as string)
        : !compareValues.includes(element as string)
  })
}

const generateExpiry = (duration: Duration, startDate?: string | Date) => {
  const date = startDate
    ? typeof startDate === 'string'
      ? DateTime.fromISO(startDate)
      : DateTime.fromJSDate(startDate)
    : DateTime.now()

  return date.plus(duration).toJSDate()
}

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

// Date formats for "getLocalisedDate"
const dateFormats = {
  short: DateTime.DATE_SHORT,
  med: DateTime.DATE_MED,
  medWeekday: DateTime.DATE_MED_WITH_WEEKDAY,
  full: DateTime.DATE_FULL,
  huge: DateTime.DATE_HUGE,
  shortDateTime: DateTime.DATETIME_SHORT,
  medDateTime: DateTime.DATETIME_MED,
  fullDateTime: DateTime.DATETIME_FULL,
  hugeDateTime: DateTime.DATETIME_HUGE,
}

// Returns ISO date string or JS Date as formatted Date (Luxon). Returns current
// date if date not supplied
const getLocalisedDateTime = (
  inputDate: string | Date,
  format: 'short' | 'med' | 'medWeekday' | 'full' | 'huge' = 'med',
  locale?: string
) => {
  const date = inputDate
    ? typeof inputDate === 'string'
      ? DateTime.fromISO(inputDate)
      : DateTime.fromJSDate(inputDate)
    : DateTime.now()

  const localisedFormat = dateFormats[format]

  if (locale) date.setLocale(locale)

  return date.toLocaleString(localisedFormat)
}

// Returns JS Date object from ISO date string. Returns current timestamp if
// no parameter supplied
const getJSDate = (date?: string) => (date ? DateTime.fromISO(date).toJSDate() : new Date())

// Returns ISO date-time string from JS Date object. Returns current timestamp
// if no parameter supplied
const getISODate = (date?: Date) =>
  date ? DateTime.fromJSDate(date).toISO() : DateTime.now().toISO()

// Extracts any numeric content from a string
// https://regex101.com/r/HG5MFW/1
const extractNumber = (input: string) => {
  const numberMatch = input.match(/-?\d*\.?\d+/gm)
  if (!numberMatch) return 0
  return Number(numberMatch[0])
}

// Returns true if input date is before (or on) the current date
// Also returns true if null
const isExpired = (date: Date | string | null) => {
  if (date === null) return true
  const testDate = typeof date === 'string' ? new Date(date) : date

  return testDate.getTime() <= Date.now()
}

// Remove diacritics (accented characters) from strings
// See https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const removeAccents = (input: string) => input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const lowerCase = (text: string) => text.toLowerCase()

// Arithmetic
const multiply = (num1: number, num2: number, decimals: number) => {
  const product = num1 * num2
  const roundingMultiplier = 10 ** decimals
  return isNaN(roundingMultiplier)
    ? product
    : Math.round(product * roundingMultiplier) / roundingMultiplier
}

// Array
const split = (text: string, delimiter: string = ',') => {
  const values = text.split(delimiter)
  return values.map((v) => v.trim())
}

export default {
  filterArray,
  generateExpiry,
  getYear,
  getFormattedDate,
  getLocalisedDateTime,
  getJSDate,
  getISODate,
  isExpired,
  extractNumber,
  removeAccents,
  lowerCase,
  multiply,
  split,
}
