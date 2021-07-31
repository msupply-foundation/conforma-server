// Utility functions to extend capabilities of expression evaluator via the
// "objectFunctions"

import { DateTime, Duration } from 'luxon'

const generateExpiry = (duration: Duration) => DateTime.now().plus(duration).toJSDate()

export default { generateExpiry }
