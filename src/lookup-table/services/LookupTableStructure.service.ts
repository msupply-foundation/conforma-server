import { LookupTableStructureModel } from '../models'
import { toCamelCase, toSnakeCase } from '../utils'
import { FieldMapType, LookupTableStructurePropType } from '../types'
import { LookupTableService } from '.'
import { LookupTableHeadersValidator } from '../utils/validations'
import { IValidator } from '../utils/validations/types'
import { ValidationErrors } from '../utils/validations/error'

const LookupTableStructureService = () => {
  let _csvFieldMap: FieldMapType[] = []
  let _finalFieldMaps: FieldMapType[] = []
  let _finalRows: any[] = []
  const lookupTableStructureModel = LookupTableStructureModel()
  const lookupTableService = LookupTableService()

  const getById = async (lookupTableStructureID: number) =>
    await lookupTableStructureModel.getByID(lookupTableStructureID)

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

  const parseCsvHeaders = (headers: any) => {
    const lookupTableHeadersValidator: IValidator = new LookupTableHeadersValidator(headers)

    if (!lookupTableHeadersValidator.isValid) {
      throw new ValidationErrors(lookupTableHeadersValidator.errorMessages)
    }

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
