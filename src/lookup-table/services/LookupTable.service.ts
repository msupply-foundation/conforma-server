import { LookupTableModel } from '../models'
import { LookupTableStructurePropType } from '../types'

const LookupTableService = () => {
  const _lookupTableModel = LookupTableModel()

  const createTable = async ({ tableName, fieldMap: fieldMaps }: LookupTableStructurePropType) => {
    try {
      return _lookupTableModel.createTable({ tableName, fieldMap: fieldMaps })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const createRows = async ({ tableName, rows }: { tableName: string; rows: any }) => {
    return await rows.map(async (row: any) => {
      delete row.id
      create({ tableName, row })
    })
  }

  const create = async ({ tableName, row }: { tableName: string; row: object }) => {
    try {
      return _lookupTableModel.create({ tableName, row })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  return {
    createTable,
    createRows,
    create,
  }
}

export default LookupTableService
