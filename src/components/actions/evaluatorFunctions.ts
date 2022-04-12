// Utility functions to extend capabilities of expression evaluator via the
// "objectFunctions" operator

import { DateTime, Duration } from 'luxon'

const generateExpiry = (duration: Duration) => DateTime.now().plus(duration).toJSDate()

const getYear = () => new Date().getFullYear()

const getFormattedDate = (formatString: string) => {
  const test = DateTime.now().toFormat(formatString)
  console.log('test', test)

  return test
}
export default { generateExpiry, getYear, getFormattedDate }
