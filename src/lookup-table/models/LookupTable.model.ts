import DBConnect from '../../components/databaseConnect'
import { LookupTableStructurePropType } from '../types'

const LookupTableModel = () => {
  const createStructure = async ({ tableName, label, fieldMap }: LookupTableStructurePropType) => {
    const text = `INSERT INTO lookup_table (name,label,field_map) VALUES ($1,$2,$3) RETURNING id`

    const result = await DBConnect.query({
      text,
      values: [tableName, label, JSON.stringify(fieldMap)],
    })
    if (result.rows[0].id) return result.rows[0].id
  }

  const getStructureById = async (lookupTableId: number) => {
    try {
      const data = await DBConnect.gqlQuery(
        `
          query getLookupTableStructure($id: Int!) {
            lookupTable(id: $id) {
              id
              label
              name
              fieldMap
            }
          }
        `,
        { id: lookupTableId }
      )
      if (!data.lookupTable)
        throw new Error(`Lookup table structure with id '${lookupTableId}' does not exist.`)
      return data.lookupTable
    } catch (error) {
      throw error
    }
  }

  const countStructureRowsByTableName = async (lookupTableName: string) => {
    try {
      const data = await DBConnect.gqlQuery(
        `
          query countStructureRowsByTableName($name: String!) {
            lookupTables(condition: {name: $name}) {
              totalCount
            }
          }
        `,
        { name: lookupTableName }
      )
      return data.lookupTables.totalCount
    } catch (error) {
      throw error
    }
  }

  const createTable = async ({ tableName, fieldMap: fieldMaps }: LookupTableStructurePropType) => {
    const text = `CREATE TABLE lookup_table_${tableName}
      (
        ${fieldMaps.map((fieldMap) => `${fieldMap.fieldname} ${fieldMap.dataType}`).join(', ')}
      )`

    const result = await DBConnect.query({ text })
    return result.rows
  }

  const createRow = async ({ tableName, row }: { tableName: string; row: any }) => {
    const text = `INSERT INTO lookup_table_${tableName}(${Object.keys(row)}) VALUES (
          ${Object.keys(row)
            .map((key, index) => {
              return '$' + String(index + 1)
            })
            .join(', ')}) RETURNING id`
    const result = await DBConnect.query({ text, values: [...Object.values(row)] })
    return result.rows.map((row: any) => row.id)
  }

  const updateRow = async ({ tableName, row }: { tableName: string; row: any }) => {
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

  const updateStructureFieldMaps = async (tableName: string, fieldMaps: any) => {
    const text = `UPDATE lookup_table SET field_map = $1 WHERE name = $2`
    try {
      const result = await DBConnect.query({ text, values: [JSON.stringify(fieldMaps), tableName] })
      return result
    } catch (err) {
      throw err
    }
  }

  const addTableColumns = async (tableName: string, fieldMap: any) => {
    const text = `ALTER TABLE lookup_table_${tableName} ADD COLUMN ${fieldMap.fieldname} ${fieldMap.dataType}`
    const result = await DBConnect.query({ text })
    return result
  }

  return {
    createStructure,
    getStructureById,
    countStructureRowsByTableName,
    createTable,
    createRow,
    updateRow,
    updateStructureFieldMaps,
    addTableColumns,
  }
}
export default LookupTableModel
