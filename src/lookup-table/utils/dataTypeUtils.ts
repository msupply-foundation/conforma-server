import { mapValues } from 'lodash'
import { FieldMapType } from '../types'

export const setDataTypes = (fieldMaps: FieldMapType[], rows: object[]) => {
  // Determine type
  const done: string[] = []
  for (const row of rows) {
    Object.entries(row).forEach(([key, value], index) => {
      if (!done.includes(key)) {
        const type = getType(value)
        if (type !== null) {
          fieldMaps[index].dataType = type
          done.push(key)
        }
      }
    })

    if (done.length === fieldMaps.length) break
  }

  const fieldMap: { [key: string]: any } = fieldMaps.reduce((acc, curr) => {
    const name = curr.fieldname
    const type = curr.dataType
    return { ...acc, [name]: type }
  }, {})

  // Now mutate rows based on those types
  rows.forEach((row, index) => {
    rows[index] = mapValues(row, (value, key) => {
      if (key === 'id') return value
      return convertType(value, fieldMap[key])
    })
  })
}

// Prepares table export by stringifying jsonb fields
// Mutates rows *in-place*
export const exportDataRows = (fieldMaps: FieldMapType[], rows: { [key: string]: any }[]) => {
  const jsonFields = fieldMaps.filter((e) => e.dataType === 'jsonb').map((e) => e.fieldname)

  rows.forEach((row) => {
    jsonFields.forEach((jsonField: string) => {
      row[jsonField] = row[jsonField] !== null ? JSON.stringify(row[jsonField]) : ''
    })
  })

  return rows
}

type PostgresDataType = 'varchar' | 'boolean' | 'integer' | 'double precision' | 'jsonb'

const getType = (value: string): PostgresDataType | null => {
  if (value === '') return null

  // Boolean
  if (value.toLowerCase() === 'false' || value.toLowerCase() === 'true') return 'boolean'

  // Number
  if (!isNaN(Number(value))) {
    // Integer or float? Check for decimal part
    if (/^\d+\.\d+$/.test(value)) return 'double precision'
    else return 'integer'
  }

  // TO-DO: Recognize ISO date/time strings

  // JSON Data
  try {
    JSON.parse(value)
    return 'jsonb'
  } catch {}

  return 'varchar'
}

const convertType = (value: string, type: PostgresDataType) => {
  if (value === '') return null
  switch (type) {
    case 'varchar':
      return value
    case 'boolean':
      return value.toLowerCase() === 'true'
    case 'integer':
      return parseInt(value)
    case 'double precision':
      return parseFloat(value)
    case 'jsonb':
      return value
    default:
      return value
  }
}
