import { LookupTableModel } from '../models'
import { LookupTableStructurePropType } from '../types'

const LookupTableService = () => {
  const _lookupTableModel = LookupTableModel()
  const _TABLE_PREFIX = 'lookup_table_'
  let _tableName: string = ''

  const getById = async ({ tableName, id }: { tableName: string; id: any }) => {
    try {
      return await _lookupTableModel.getById({ tableName: _TABLE_PREFIX + tableName, id })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const createTable = async ({ tableName, fieldMap: fieldMaps }: LookupTableStructurePropType) => {
    try {
      return await _lookupTableModel.createTable({ tableName, fieldMap: fieldMaps })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const addNewColumns = async (tableName: string, fieldMaps: any) => {
    try {
      for (let fieldMap of fieldMaps) {
        await _lookupTableModel.addNewColumn(tableName, fieldMap)
      }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  const createUpdateRows = async (tableName: string, rows: any) => {
    for (let row of rows) {
      if (row.id === '') {
        await _lookupTableModel.create({ tableName, row })
      } else {
        await _lookupTableModel.update({ tableName, row })
      }
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
    set tableName(name: string) {
      _tableName = name
    },
    get tableName() {
      return _tableName
    },
    getById,
    addNewColumns,
    createTable,
    createUpdateRows,
    createRows,
    create,
  }
}

export default LookupTableService
