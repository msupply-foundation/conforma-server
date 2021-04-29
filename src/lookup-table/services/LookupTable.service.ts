import { LookupTableModel } from '../models'
import { FieldMapType, LookupTableStructureFull } from '../types'
import { toCamelCase, toSnakeCase } from '../utils'
import { LookupTableHeadersValidator, LookupTableNameValidator } from '../utils/validations'
import { ValidationErrors } from '../utils/validations/error'
import { ILookupTableNameValidator, IValidator } from '../utils/validations/types'

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

  // Initilisation
  const lookupTableModel = LookupTableModel()
  if (props.tableId) {
    tableId = props.tableId
    structure = await lookupTableModel.getStructureById(tableId)
  } else if (props.tableNameLabel) {
    tableNameLabel = props.tableNameLabel
  }

  // Exported Methods
  const getAllRowsForTable = async () => await lookupTableModel.getAllRowsForTable(structure)

  const createTable = async () => {
    tableName = toSnakeCase(tableNameLabel)

    const lookupTableNameValidator: ILookupTableNameValidator = new LookupTableNameValidator({
      model: lookupTableModel,
      tableName,
    })

    await lookupTableNameValidator.validate()

    if (!lookupTableNameValidator.isValid)
      throw new ValidationErrors(lookupTableNameValidator.errors)

    const results = await compareFieldMaps()

    tableId = await lookupTableModel.createStructure({
      name: tableName,
      label: tableNameLabel,
      fieldMap: fieldMaps,
    })

    await lookupTableModel.createTable({
      name: tableName,
      fieldMap: fieldMaps,
    })

    await createUpdateRows()

    return buildSuccessMessage(results)
  }

  const addRow = (row: object): void => {
    rows.push(row)
  }

  const updateTable = async () => {
    tableName = structure.name
    tableNameLabel = structure.label
    tableId = structure.id
    dbFieldMap = structure.fieldMap

    const results = await compareFieldMaps()
    await createNewColumns()
    await createUpdateRows()

    return buildSuccessMessage(results)
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

  const compareFieldMaps = () => {
    fieldMaps = [...dbFieldMap, ...fieldMaps].filter(
      ((set) => (obj: any) => (set.has(obj.label) ? false : set.add(obj.label)))(new Set())
    )

    return {
      onlyInDb: dbFieldMap.filter(comparer(fieldMaps)),
      onlyInCsv: fieldMaps.filter(comparer(dbFieldMap)),
      inBoth: dbFieldMap.filter((current: any) =>
        fieldMaps.filter((csvMap: any) => csvMap.label === current.label)
      ),
      finalFieldMap: fieldMaps,
    }
  }

  function comparer(otherArray: any[]) {
    return function (current: any) {
      return (
        otherArray.filter(function (other) {
          return other.label == current.label
        }).length == 0
      )
    }
  }

  const createUpdateRows = async () => {
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
    getAllRowsForTable,
    createTable,
    updateTable,
    parseCsvHeaders,
    addRow,
  }
}

export default LookupTableService
