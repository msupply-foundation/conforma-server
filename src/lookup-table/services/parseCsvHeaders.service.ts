import { FieldMapType } from '../types'
import { toCamelCase, toSnakeCase } from '../utils'

const parseCsvHeaders = () => {
  let _fieldMaps: FieldMapType[] = []

  const parseHeaders = (headers: any) =>
    headers.map((h: string) => {
      const fieldName = toSnakeCase(h)
      const gqlName = toCamelCase(h)

      if (!/^[A-Za-z]{1}/.test(h)) {
        throw new Error(`Header '${h}' has non-alphabet first letter.`)
      }

      if (!/^[A-Za-z0-9_-\s]+$/.test(h)) {
        throw new Error(`Header '${h}' can only have space, dash and alpha-numeric characters.`)
      }

      const fieldMap: FieldMapType = {
        label: h!,
        fieldname: fieldName,
        gqlName: fieldName == 'id' ? 'id' : gqlName,
        dataType: fieldName == 'id' ? 'serial PRIMARY KEY' : 'varchar',
      }

      _fieldMaps.push(fieldMap)

      return fieldMap.fieldname
    })

  return {
    parse: parseHeaders,
    get fieldMap() {
      return _fieldMaps
    },
  }
}

export default parseCsvHeaders
