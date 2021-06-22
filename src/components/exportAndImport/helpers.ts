import { DatabaseTables } from './types'

export const filterByIncludeAndExclude = (
  includeTables: string[],
  excludeTables: string[],
  databaseTables: DatabaseTables
) => {
  const isIncludeMode = includeTables.length > 0
  const isExcludeMode = excludeTables.length > 0
  return databaseTables.filter(
    ({ tableName }) =>
      (isIncludeMode && includeTables.includes(tableName)) ||
      (isExcludeMode && !excludeTables.includes(tableName)) ||
      (!isIncludeMode && !isExcludeMode)
  )
}

export const noQuoteKeyStringify = (json: object) => {
  const isArray = Array.isArray(json)

  let result = isArray ? '[' : '{'
  Object.entries(json).forEach(([key, value]) => {
    let resultValue = value

    if (typeof value === 'string') resultValue = `${JSON.stringify(value)}`
    if (Array.isArray(value)) resultValue = noQuoteKeyStringify(value)
    else if (typeof value === 'object' && value !== null) resultValue = noQuoteKeyStringify(value)

    if (isArray) result += resultValue + ','
    else result += key + ':' + resultValue + ','
  })

  if (result.length > 1) result = result.slice(0, result.length - 1)

  return result + (isArray ? ']' : '}')
}
