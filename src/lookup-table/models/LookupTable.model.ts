import { QueryResult } from 'pg'
import DBConnect from '../../components/databaseConnect'
import {
  FieldMapType,
  GqlQueryResult,
  LookupTableBase,
  LookupTableStructureFull,
  LookupTableStructure,
} from '../types'
import config from '../../config'
import { exportDataRows } from '../utils/dataTypeUtils'

const { dataTablePrefix } = config

const LookupTableModel = () => {
  const getAllRowsForTable = async ({ tableName, fieldMap }: LookupTableStructureFull) => {
    const mappedField = ({ label, fieldname }: FieldMapType) => `"${fieldname}" as "${label}"`
    const fields = fieldMap.map(mappedField).join(',')
    const text = `SELECT ${fields} FROM ${dataTablePrefix}${tableName} ORDER BY id`
    const result = await DBConnect.query({ text })
    return exportDataRows(fieldMap, result.rows)
  }

  const createStructure = async ({ tableName, displayName, fieldMap }: LookupTableStructure) => {
    try {
      const text = `INSERT INTO data_table (table_name, display_name, field_map, is_lookup_table) VALUES ($1,$2,$3, true) RETURNING id`

      const result: QueryResult<{ id: number }> = await DBConnect.query({
        text,
        values: [tableName, displayName, JSON.stringify(fieldMap)],
      })

      if (result.rows[0].id) return result.rows[0].id

      throw new Error(`Lookup table structure '${displayName}' could not be created.`)
    } catch (error) {
      throw error
    }
  }

  const getStructureById = async (lookupTableId: number) => {
    try {
      const result: GqlQueryResult<LookupTableStructureFull> = await DBConnect.gqlQuery(
        `
          query getLookupTableStructure($id: Int!) {
            dataTable(id: $id) {
              id
              tableName
              displayName
              fieldMap
            }
          }
        `,
        { id: lookupTableId }
      )

      if (!result?.dataTable?.id)
        throw new Error(`Lookup table structure with id '${lookupTableId}' does not exist.`)

      return result.dataTable
    } catch (error) {
      throw error
    }
  }

  const countStructureRowsByTableName = async (lookupTableName: string) => {
    try {
      const result = await DBConnect.gqlQuery(
        `
          query countStructureRowsByTableName($name: String!) {
            dataTables(condition: {displayName: $name}) {
              totalCount
            }
          }
        `,
        { name: lookupTableName }
      )

      return result.dataTables.totalCount as number
    } catch (error) {
      throw error
    }
  }

  const createTable = async ({
    tableName,
    fieldMap: fieldMaps,
  }: LookupTableBase): Promise<boolean> => {
    try {
      const text = `CREATE TABLE ${dataTablePrefix}${tableName}
      (
        ${fieldMaps.map((fieldMap) => `${fieldMap.fieldname} ${fieldMap.dataType}`).join(', ')}
      )`

      await DBConnect.query({ text })
      return true
    } catch (error) {
      throw error
    }
  }

  const doesIdExist = async (table: string, id: number) => {
    try {
      const text = `
        SELECT id FROM ${table}
        WHERE id = $1
      `
      const count = (await DBConnect.query({ text, values: [id] })).rows.length
      return !!count
    } catch (error) {
      throw error
    }
  }

  const createOrUpdateRow = async (
    tableName: string,
    row: Record<string, any>
  ): Promise<{ id: string }[] | boolean> => {
    const table = `${dataTablePrefix}${tableName}`
    try {
      if (!row.id) delete row.id
      else row.id = Number(row.id)

      const id = row.id ?? null

      const operation: 'CREATE' | 'UPDATE' = !id
        ? 'CREATE'
        : (await doesIdExist(table, id))
        ? 'UPDATE'
        : 'CREATE'

      switch (operation) {
        case 'CREATE':
          return await createRow(table, row)
        case 'UPDATE':
          return await updateRow(table, row)
      }
    } catch (error) {
      throw error
    }
  }

  const createRow = async (table: string, row: Record<string, any>): Promise<{ id: string }[]> => {
    try {
      const text = `INSERT INTO ${table}(${Object.keys(row)}) VALUES (
          ${Object.keys(row)
            .map((_, index) => {
              return '$' + String(index + 1)
            })
            .join(', ')}) RETURNING id`

      const result: QueryResult<{ id: number }> = await DBConnect.query({
        text,
        values: [...Object.values(row)],
      })

      // Add new id to row property so it doesn't get deleted immediately
      const id = result.rows[0].id
      row.id = id

      return result.rows.map((row: any) => row.id)
    } catch (error) {
      throw error
    }
  }

  const updateRow = async (table: string, row: Record<string, any>): Promise<boolean> => {
    try {
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

      const text = `UPDATE ${table} SET ${setText} WHERE id = $${primaryKeyIndex}`
      await DBConnect.query({ text, values: [...Object.values(row)] })
      return true
    } catch (error) {
      throw error
    }
  }

  const deleteRemovedRows = async (
    tableName: string,
    rows: { id?: number }[]
  ): Promise<boolean> => {
    try {
      const rowIds = rows.filter(({ id }) => !!id).map(({ id }) => Number(id))
      const text = `
        DELETE FROM ${dataTablePrefix}${tableName}
        WHERE NOT (id = ANY($1));
      `
      await DBConnect.query({ text, values: [rowIds] })
      return true
    } catch (error) {
      throw error
    }
  }

  const updateStructureFieldMaps = async (
    tableName: string,
    fieldMaps: FieldMapType[]
  ): Promise<boolean> => {
    const text = `UPDATE data_table SET field_map = $1 WHERE table_name = $2`
    try {
      await DBConnect.query({ text, values: [JSON.stringify(fieldMaps), tableName] })
      return true
    } catch (err) {
      throw err
    }
  }

  const addTableColumns = async (tableName: string, fieldMap: FieldMapType): Promise<boolean> => {
    try {
      const text = `ALTER TABLE ${dataTablePrefix}${tableName} ADD COLUMN ${fieldMap.fieldname} ${fieldMap.dataType}`
      await DBConnect.query({ text })
      return true
    } catch (err) {
      throw err
    }
  }

  return {
    createStructure,
    getStructureById,
    getAllRowsForTable,
    countStructureRowsByTableName,
    createTable,
    createOrUpdateRow,
    deleteRemovedRows,
    updateStructureFieldMaps,
    addTableColumns,
  }
}
export default LookupTableModel
