import DBConnect from '../database/databaseConnect'
import { errorMessage, isObject } from '../../components/utilityFunctions'
import { DataTable } from '../../generated/postgres'
import { FullLinkedEntities } from './types'

const databaseMethods = {
  beginTransaction: async () => {
    try {
      await DBConnect.query({ text: 'BEGIN TRANSACTION;' })
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  commitTransaction: async () => {
    try {
      await DBConnect.query({ text: 'COMMIT TRANSACTION;' })
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  cancelTransaction: async () => {
    try {
      await DBConnect.query({ text: 'ROLLBACK TRANSACTION;' })
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getRecord: async <T>(
    tableName: string,
    value: number | string,
    field: string = 'id'
  ): Promise<T> => {
    try {
      const text = `
            SELECT * FROM ${tableName} WHERE ${field} = $1
        `
      // Get table
      const result = await DBConnect.query({ text, values: [value] })
      return result.rows[0]
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getRecordsByField: async <T>(tableName: string, field: string, value: unknown): Promise<T[]> => {
    try {
      const text = `
            SELECT * FROM ${tableName} WHERE ${field} = $1
          `
      const result = await DBConnect.query({ text, values: [value] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  updateChecksum: async (tableName: string, id: number, checksum: string) => {
    try {
      const text = `
        UPDATE ${tableName}
            SET checksum = $2,
            last_modified = NOW()
            WHERE id = $1`
      await DBConnect.query({ text, values: [id, checksum] })
      return
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getLinkedEntities: async <T>(input: {
    templateId: number
    table: string
    joinTable: string
  }): Promise<T[]> => {
    const { templateId, table, joinTable } = input
    const text = `
      SELECT *
      FROM ${table} WHERE id IN (
        SELECT ${table}_id FROM ${joinTable}
        WHERE template_id = $1
      )
    `
    try {
      const result = await DBConnect.query({ text, values: [templateId] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getLinkedDataTables: async (tableNames: string[]): Promise<DataTable[]> => {
    const text = `
      SELECT table_name, checksum, last_modified
        FROM data_table
        WHERE table_name = ANY($1)
        AND is_lookup_table = TRUE;
    `
    try {
      const result = await DBConnect.query({ text, values: [tableNames] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getDataViewColumns: async (tableName: string) => {
    const text = `
      SELECT *
      FROM data_view_column_definition
      WHERE table_name = $1
    `
    try {
      const result = await DBConnect.query({ text, values: [tableName] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  commitTemplate: async (
    templateId: number,
    versionId: string,
    comment: string | null,
    entityData: FullLinkedEntities
  ) => {
    const text = `
      UPDATE template SET
        version_id = $2,
        version_comment = $3,
        linked_entity_data = $4
        WHERE id = $1;`

    try {
      await DBConnect.query({ text, values: [templateId, versionId, comment, entityData] })
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  insertRecord: async (tableName: string, data: Record<string, unknown>) => {
    const fields = Object.keys(data).join(', ')
    const values = Object.values(data).map((value) =>
      isObject(value) || Array.isArray(value) ? JSON.stringify(value) : value
    )

    try {
      const text = `
        INSERT INTO ${tableName}
          (${fields})
        VALUES (${DBConnect.getValuesPlaceholders(values)})
        RETURNING id;`
      const result = await DBConnect.query({ text, values })
      return result.rows[0].id
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
}

export default databaseMethods
