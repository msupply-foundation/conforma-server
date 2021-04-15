import { LookupTableModel } from '../models'
import { FieldMapType } from '../types'
import { toCamelCase, toSnakeCase } from '../utils'
import { LookupTableHeadersValidator } from '../utils/validations'
import { ValidationErrors } from '../utils/validations/error'
import { IValidator } from '../utils/validations/types'

type LookupTableServiceProps = {
  tableId?: number
  tableName?: string
  tableNameLabel?: string
  fieldMaps?: FieldMapType[]
  rows?: object[]
}

const LookupTableService = (structure: LookupTableServiceProps) => {
  let { tableName = '', tableNameLabel = '', tableId = 0, fieldMaps = [], rows = [] } = structure
  let dbFieldMap: any = []
  const _lookupTableModel = LookupTableModel()

  const createTable = async () => {
    tableName = toSnakeCase(tableNameLabel)

    tableId = await _lookupTableModel.createStructure({
      tableName,
      label: tableNameLabel,
      fieldMap: fieldMaps,
    })

    await _lookupTableModel.createTable({
      tableName,
      fieldMap: fieldMaps,
    })

    await _createUpdateRows()
  }

  const updateTable = async () => {
    const result = await _lookupTableModel.getStructureById(tableId)
    tableName = result.name
    tableNameLabel = result.label
    tableId = result.id
    dbFieldMap = result.fieldMap
    await _compareFieldMaps()
    await _createNewColumns()
    await _createUpdateRows()
  }

  const addRow = (row: object): void => {
    rows.push(row)
  }

  const parseCsvHeaders = (headers: any) => {
    const lookupTableHeadersValidator: IValidator = new LookupTableHeadersValidator(headers)

    if (!lookupTableHeadersValidator.isValid) {
      throw new ValidationErrors(lookupTableHeadersValidator.errorMessages)
    }

    return headers.map((header: string) => {
      const fieldName = toSnakeCase(header)
      const gqlName = toCamelCase(header)

      const fieldMap: FieldMapType = {
        label: header!,
        fieldname: fieldName,
        gqlName: fieldName == 'id' ? 'id' : gqlName,
        dataType: fieldName == 'id' ? 'serial PRIMARY KEY' : 'varchar',
      }

      fieldMaps.push(fieldMap)

      return fieldMap.fieldname
    })
  }

  const _createNewColumns = async () => {
    const fieldsToAdd = fieldMaps.filter(
      (obj: any) => dbFieldMap.filter((otherObj: any) => otherObj.label == obj.label).length === 0
    )

    await _lookupTableModel.updateStructureFieldMaps(tableName, fieldMaps)
    for (let fieldMap of fieldsToAdd) {
      await _lookupTableModel.addTableColumns(tableName, fieldMap)
    }
  }

  const _compareFieldMaps = () => {
    fieldMaps = [...dbFieldMap, ...fieldMaps].filter(
      ((set) => (obj: any) => (set.has(obj.label) ? false : set.add(obj.label)))(new Set())
    )
  }

  const _createUpdateRows = async () => {
    await rows.forEach(async (row: any) => {
      if (row.id === '') {
        delete row.id
        await _lookupTableModel.createRow({ tableName, row })
      } else {
        await _lookupTableModel.updateRow({ tableName, row })
      }
    })
  }

  return {
    createTable,
    updateTable,
    parseCsvHeaders,
    addRow,
  }
}

export default LookupTableService
