import { LookupTableStructurePropType } from '../types'
import DBConnect from '../../components/databaseConnect'

const LookupTableModel = () => {
  const getById = async ({ tableName, id }: any) => {
    const text = `SELECT * FROM ${tableName} WHERE id = $1 LIMIT 1`
    const result = await DBConnect.query({ text, values: [Number(id)] })
    return result.rows[0]
  }

  const createTable = async ({ tableName, fieldMap: fieldMaps }: LookupTableStructurePropType) => {
    const text = `CREATE TABLE lookup_table_${tableName}
      (
        ${fieldMaps.map((fieldMap) => `${fieldMap.fieldname} ${fieldMap.dataType}`).join(', ')}
      )`

    const result = await DBConnect.query({ text })
    return result.rows
  }

  const addNewColumn = async (tableName: string, fieldMap: any) => {
    const text = `ALTER TABLE lookup_table_${tableName} ADD COLUMN ${fieldMap.fieldname} ${fieldMap.dataType}`
    const result = await DBConnect.query({ text })
    return result
  }

  const create = async ({ tableName, row }: { tableName: string; row: any }) => {
    delete row.id
    const text = `INSERT INTO lookup_table_${tableName}(${Object.keys(row)}) VALUES (
          ${Object.keys(row)
            .map((key, index) => {
              return '$' + String(index + 1)
            })
            .join(', ')}) RETURNING id`
    const result = await DBConnect.query({ text, values: [...Object.values(row)] })
    return result.rows.map((row: any) => row.id)
  }

  const update = async ({ tableName, row }: { tableName: string; row: any }) => {
    let primaryKeyIndex = 0
    const setText = Object.keys(row)
      .map((key, index) => {
        const currentIndex = index + 1
        if (key === 'id') {
          primaryKeyIndex = currentIndex
          return ''
        }

        return `${key} = $${currentIndex}`
      })
      .filter(Boolean)
      .join(', ')

    const text = `UPDATE lookup_table_${tableName} SET
    ${setText} WHERE id = $${primaryKeyIndex}`

    const result = await DBConnect.query({ text, values: [...Object.values(row)] })
    return true
  }

  return { getById, createTable, create, update, addNewColumn }
}

export default LookupTableModel
