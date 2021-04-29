import { LookupTableModel } from '../models'
import { FieldMapType, LookupTableStructureFull } from '../types'
import { comparerFieldMaps, mergeFieldMapsByProperty, toCamelCase, toSnakeCase } from '../utils'
import { IValidator, LookupTableHeadersValidator, ValidationErrors } from '../utils/validations'

type LookupTableServiceProps = {
  tableId?: number
  tableNameLabel?: string
}

const LookupTableService = async (props: LookupTableServiceProps) => {
  let tableName = ''
  let tableId = 0
  let tableNameLabel = ''
  let fieldMaps: FieldMapType[] = []
  let rows: object[] = []
  let dbFieldMap: any = []
  let structure: LookupTableStructureFull

  // Initialisation
  const lookupTableModel = LookupTableModel()

  if (props.tableId) {
    tableId = props.tableId
    structure = await lookupTableModel.getStructureById(tableId)
  } else if (props.tableNameLabel) {
    tableNameLabel = props.tableNameLabel
  }

  // Exported Methods
  const getAllRowsForTable = async () => await lookupTableModel.getAllRowsFromTable(structure)

  const createTable = async () => {
    tableName = toSnakeCase(tableNameLabel)

    const results = updateFieldMaps()

    fieldMaps.unshift({
      label: 'ID',
      fieldname: 'id',
      gqlName: 'ID',
      dataType: 'serial PRIMARY KEY',
    })

    await lookupTableModel.createTable({
      name: tableName,
      fieldMap: fieldMaps,
    })

    tableId = await lookupTableModel.createStructure({
      name: tableName,
      label: tableNameLabel,
      fieldMap: fieldMaps,
    })

    await createUpdateRows()

    return buildSuccessMessage(results)
  }

  const addRow = (row: object): void => {
    rows.push(row)
  }

  const updateTable = async () => {
    const result = await lookupTableModel.getStructureById(tableId)
    tableName = result.name
    tableNameLabel = result.label
    tableId = result.id
    dbFieldMap = result.fieldMap

    const results = updateFieldMaps()
    await createNewColumns()
    await createUpdateRows()

    return buildSuccessMessage(results)
  }

  const parseCsvHeaders = (headers: any) => {
    const lookupTableHeadersValidator: IValidator = new LookupTableHeadersValidator({
      headers,
      isImport: tableId === 0,
    })

    if (!lookupTableHeadersValidator.isValid) {
      throw new ValidationErrors(lookupTableHeadersValidator.errors)
    }

    return headers.map((header: string) => {
      const fieldName = toSnakeCase(header)
      const gqlName = toCamelCase(header)

      const fieldMap: FieldMapType = {
        label: header,
        fieldname: fieldName,
        gqlName,
        dataType: 'varchar',
      }

      fieldMaps.push(fieldMap)

      return fieldMap.fieldname
    })
  }

  // Helpers

  const buildSuccessMessage = ({
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

  const createNewColumns = async () => {
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

  const createUpdateRows = async () => {
    await rows.forEach(async (row: any) => {
      if (!('id' in row) || !row.id) {
        'id' in row && delete row.id
        await lookupTableModel.createRow({ tableName, row })
      } else {
        await lookupTableModel.updateRow({ tableName, row })
      }
    })
  }

  return {
    getAllRowsForTable,
    createTable,
    updateTable,
    parseCsvHeaders,
    addRow,
  }
}

export default LookupTableService
