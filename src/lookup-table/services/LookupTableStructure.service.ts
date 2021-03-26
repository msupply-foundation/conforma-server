import { LookupTableStructureModel } from '../models'
import { toCamelCase, toSnakeCase } from '../utils'
import { FieldMapType, LookupTableStructurePropType } from '../types'

const LookupTableStructureService = () => {
  let _csvFieldMap: FieldMapType[] = []
  const lookupTableStructureModel = LookupTableStructureModel()

  const getById = async (lookupTableStructureID: number) => {
    try {
      return lookupTableStructureModel.getByID(lookupTableStructureID)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const create = async ({ tableName, label, fieldMap }: LookupTableStructurePropType) => {
    try {
      return lookupTableStructureModel.create({ tableName, label, fieldMap })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const parseCsvHeaders = (headers: any) =>
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

      _csvFieldMap.push(fieldMap)

      return fieldMap.fieldname
    })

  return {
    create,
    getById,
    parseCsvHeaders,
    get csvFieldMap() {
      return _csvFieldMap
    },
  }
}

export default LookupTableStructureService
