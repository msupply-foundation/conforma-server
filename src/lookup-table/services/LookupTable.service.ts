import { LookupTableModel } from '../models'
import { FieldMapType } from '../types'
import { comparerFieldMaps, mergeFieldMapsByProperty, toCamelCase, toSnakeCase } from '../utils'
import { IValidator, LookupTableHeadersValidator, ValidationErrors } from '../utils/validations'

type LookupTableServiceProps = {
  tableId?: number
  tableName?: string
  tableNameLabel?: string
  fieldMaps?: FieldMapType[]
  rows?: object[]
}

const LookupTableService = (structure: LookupTableServiceProps) => {
  let { tableName = '', tableNameLabel = '', tableId = 0, fieldMaps = [], rows = [] } = structure
  let dbFieldMap: FieldMapType[] = []
  const lookupTableModel = LookupTableModel()

  const createTable = async () => {
    tableName = toSnakeCase(tableNameLabel)

    const results = updateFieldMaps()

    await lookupTableModel.createTable({
      name: tableName,
      fieldMap: fieldMaps,
    })

    tableId = await lookupTableModel.createStructure({
      name: tableName,
      label: tableNameLabel,
      fieldMap: fieldMaps,
    })

    await _createUpdateRows()

    return _buildSuccessMessage(results)
  }

  const updateTable = async () => {
    const result = await lookupTableModel.getStructureById(tableId)
    tableName = result.name
    tableNameLabel = result.label
    tableId = result.id
    dbFieldMap = result.fieldMap

    const results = updateFieldMaps()
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

    await lookupTableModel.updateStructureFieldMaps(tableName, fieldMaps)
    for (let fieldMap of fieldsToAdd) {
      await lookupTableModel.addTableColumns(tableName, fieldMap)
    }
  }

  const updateFieldMaps = () => {
    fieldMaps = mergeFieldMapsByProperty(dbFieldMap, fieldMaps, 'label')

    return {
      onlyInDb: dbFieldMap.filter(comparerFieldMaps(fieldMaps, 'label')),
      onlyInCsv: fieldMaps.filter(comparerFieldMaps(dbFieldMap, 'label')),
      inBoth: dbFieldMap.filter((current: FieldMapType) =>
        fieldMaps.filter((csvMap: FieldMapType) => csvMap.label === current.label)
      ),
      finalFieldMap: fieldMaps,
    }
  }

  const _createUpdateRows = async () => {
    await rows.forEach(async (row: any) => {
      if (row.id === '') {
        delete row.id
        await lookupTableModel.createRow({ tableName, row })
      } else {
        await lookupTableModel.updateRow({ tableName, row })
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
