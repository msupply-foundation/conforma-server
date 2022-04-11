// Utility functions to extend capabilities of expression evaluator via the
// "objectFunctions" operator

import { DateTime, Duration } from 'luxon'

const generateExpiry = (duration: Duration) => DateTime.now().plus(duration).toJSDate()

const getDay = () => new Date().getDate()

const getMonth = () => new Date().getMonth()

const getYear = () => new Date().getFullYear()

const getDate = () => `${getDay()}-${getMonth()}-${getYear()}`

export default { generateExpiry, getDay, getMonth, getYear, getDate }
