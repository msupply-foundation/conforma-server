import { LookupTableStructurePropType } from '../types'
import DBConnect from '../../components/databaseConnect'

const LookupTableModel = () => {
  const createTable = async ({ tableName, fieldMap: fieldMaps }: LookupTableStructurePropType) => {
    const text = `CREATE TABLE lookup_table_${tableName}
      (
        ${fieldMaps.map((fieldMap) => `${fieldMap.fieldname} ${fieldMap.dataType}`).join(', ')}
      )`

    const result = await DBConnect.query({ text })
    return result.rows
  }

  const create = async ({ tableName, row }: { tableName: string; row: object }) => {
    const text = `INSERT INTO lookup_table_${tableName}(${Object.keys(row)}) VALUES (
          ${Object.keys(row)
            .map((key, index) => {
              return '$' + String(index + 1)
            })
            .join(', ')}) RETURNING id`
    const result = await DBConnect.query({ text, values: [...Object.values(row)] })
    return result.rows.map((row: any) => row.id)
  }

  return { createTable, create }
}

export default LookupTableModel
