import { LookupTableModel } from '../models'
import { FieldMapType } from '../types'
import { toCamelCase, toSnakeCase } from '../utils'
import { LookupTableHeadersValidator, LookupTableNameValidator } from '../utils/validations'
import { ValidationErrors } from '../utils/validations/error'
import { ILookupTableNameValidator, IValidator } from '../utils/validations/types'

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

    const lookupTableNameValidator: ILookupTableNameValidator = new LookupTableNameValidator({
      model: _lookupTableModel,
      tableName,
    })

    await lookupTableNameValidator.validate()

    if (!lookupTableNameValidator.isValid)
      throw new ValidationErrors(lookupTableNameValidator.errors)

    const results = await _compareFieldMaps()

    tableId = await _lookupTableModel.createStructure({
      name: tableName,
      label: tableNameLabel,
      fieldMap: fieldMaps,
    })

    await _lookupTableModel.createTable({
      name: tableName,
      fieldMap: fieldMaps,
    })

    await _createUpdateRows()

    return _buildSuccessMessage(results)
  }

  const updateTable = async () => {
    const result = await _lookupTableModel.getStructureById(tableId)
    tableName = result.name
    tableNameLabel = result.label
    tableId = result.id
    dbFieldMap = result.fieldMap

    const results = await _compareFieldMaps()
    await _createNewColumns()
    await _createUpdateRows()

    return _buildSuccessMessage(results)
  }

  const _buildSuccessMessage = ({
    onlyInDb,
    onlyInCsv,
    inBoth,
    finalFieldMap,
  }: {
    onlyInDb: any
    onlyInCsv: FieldMapType[]
    inBoth: any
    finalFieldMap: FieldMapType[]
  }) => {
    const message: string[] = []
    if (inBoth.length)
      message.push(
        `Table rows' fields ${inBoth.map((fieldMap: any) => fieldMap.label).join(', ')} are updated`
      )

    if (onlyInCsv.length)
      message.push(
        `Table rows' fields ${onlyInCsv
          .map((fieldMap: any) => fieldMap.label)
          .join(', ')} are newly added`
      )

    if (onlyInDb.length)
      message.push(
        `Table rows' fields ${onlyInDb
          .map((fieldMap: any) => fieldMap.label)
          .join(', ')} are left unchanged`
      )

    if (finalFieldMap.length)
      message.push(
        `Final Table fields are ${finalFieldMap.map((fieldMap: any) => fieldMap.label).join(', ')}.`
      )

    return message
  }

  const addRow = (row: object): void => {
    rows.push(row)
  }

  const parseCsvHeaders = (headers: any) => {
    const lookupTableHeadersValidator: IValidator = new LookupTableHeadersValidator(headers)

    if (!lookupTableHeadersValidator.isValid) {
      throw new ValidationErrors(lookupTableHeadersValidator.errors)
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

    return {
      onlyInDb: dbFieldMap.filter(_comparer(fieldMaps)),
      onlyInCsv: fieldMaps.filter(_comparer(dbFieldMap)),
      inBoth: dbFieldMap.filter((current: any) =>
        fieldMaps.filter((csvMap: any) => csvMap.label === current.label)
      ),
      finalFieldMap: fieldMaps,
    }
  }

  function _comparer(otherArray: any[]) {
    return function (current: any) {
      return (
        otherArray.filter(function (other) {
          return other.label == current.label
        }).length == 0
      )
    }
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
