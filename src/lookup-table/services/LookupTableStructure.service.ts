import { LookupTableStructureModel } from '../models'
import { toCamelCase, toSnakeCase } from '../utils'
import { FieldMapType, LookupTableStructurePropType } from '../types'
import { LookupTableService } from '.'

class HeaderValidationError extends Error {
  constructor(message: string[]) {
    super(JSON.stringify(message))
    this.name = 'ValidationError'
  }
}

const LookupTableStructureService = () => {
  let _csvFieldMap: FieldMapType[] = []
  let _finalFieldMaps: FieldMapType[] = []
  let _finalRows: any[] = []
  const lookupTableStructureModel = LookupTableStructureModel()
  const lookupTableService = LookupTableService()

  const getById = async (lookupTableStructureID: number) => {
    try {
      return await lookupTableStructureModel.getByID(lookupTableStructureID)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const createNewColumns = async (dbStructure: any) => {
    const dbFieldMap = dbStructure.fieldMap
    const fieldsToAdd = _finalFieldMaps.filter(
      (obj) => dbFieldMap.filter((otherObj: any) => otherObj.label == obj.label).length === 0
    )

    await updateFieldMaps(dbStructure.name, _finalFieldMaps)
    await lookupTableService.addNewColumns(dbStructure.name, fieldsToAdd)
    return fieldsToAdd
  }

  const updateFieldMaps = async (tableName: string, fieldMaps: any) => {
    try {
      await lookupTableStructureModel.updateFieldMaps(tableName, fieldMaps)
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

  const validateHeaders = (headers: string[]) => {
    let errors: string[] = []

    if (headers.findIndex((header) => 'id' === header.toLowerCase()) === -1) {
      errors.push(`Column header 'ID' is required`)
    }

    return errors.concat(
      headers
        .map((header) => {
          let errorList: string[] = []
          if (!/^[A-Za-z]{1}/.test(header)) {
            errorList.push(`Column header '${header}' has non-alphabet first letter.`)
          }
          if (!/^[A-Za-z0-9_-\s]+$/.test(header)) {
            errorList.push(
              `Column header '${header}' can only have space, dash and alpha-numeric characters.`
            )
          }
          return errorList
        })
        .flat()
    )
  }

  const parseCsvHeaders = (headers: any) => {
    const HeaderValidationErrors = validateHeaders(headers)

    if (HeaderValidationErrors.length > 0) throw new HeaderValidationError(HeaderValidationErrors)

    return headers.map((h: string) => {
      const fieldName = toSnakeCase(h)
      const gqlName = toCamelCase(h)

      const fieldMap: FieldMapType = {
        label: h!,
        fieldname: fieldName,
        gqlName: fieldName == 'id' ? 'id' : gqlName,
        dataType: fieldName == 'id' ? 'serial PRIMARY KEY' : 'varchar',
      }

      _csvFieldMap.push(fieldMap)

      return fieldMap.fieldname
    })
  }

  const compareFieldMaps = (dbFieldMaps: any, csvFieldMaps: any) => {
    _finalFieldMaps = [...dbFieldMaps, ...csvFieldMaps].filter(
      ((set) => (obj: any) => (set.has(obj.label) ? false : set.add(obj.label)))(new Set())
    )
    return _finalFieldMaps
  }

  const addToCsvRows = async (row: any, lookupTableDbStructure: any) => {
    const dbFields: string[] = _finalFieldMaps.map((map) => map.fieldname)
    let dbRow: any = {}
    try {
      if (row.id) {
        dbRow = await lookupTableService.getById({
          tableName: lookupTableDbStructure.name,
          id: row.id,
        })
      }

      for (let dbField of dbFields) {
        dbRow[dbField] = row[dbField] || ''
      }
      _finalRows.push(dbRow)
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  return {
    create,
    getById,
    parseCsvHeaders,
    compareFieldMaps,
    addToCsvRows,
    createNewColumns,
    get csvFieldMap() {
      return _csvFieldMap
    },
    get finalFieldMap() {
      return _finalFieldMaps
    },
    get finalRows() {
      return _finalRows
    },
  }
}

export default LookupTableStructureService
