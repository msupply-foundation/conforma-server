// Utility functions to extend capabilities of expression evaluator via the
// "objectFunctions" operator

import { DateTime, Duration } from 'luxon'

const generateExpiry = (duration: Duration) => DateTime.now().plus(duration).toJSDate()

// getYear() => "2022"
// getYear("short") => "22"
const getYear = (type?: 'short'): string =>
  type === 'short' ? String(new Date().getFullYear()).slice(2) : String(new Date().getFullYear())

const getFormattedDate = (formatString: string) => DateTime.now().toFormat(formatString)

export default { generateExpiry, getYear, getFormattedDate }
