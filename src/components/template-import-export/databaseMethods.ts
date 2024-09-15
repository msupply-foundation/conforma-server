import DBConnect from '../database/databaseConnect'
import { errorMessage } from '../../components/utilityFunctions'
import { commitTemplate } from './commitTemplate'
import { FullLinkedEntities } from './getTemplateLinkedEntities'

const databaseMethods = {
  getRecord: async <T>(tableName: string, id: number): Promise<T> => {
    try {
      const text = `
            SELECT * FROM ${tableName} WHERE id = $1
        `
      // Get table
      const result = await DBConnect.query({ text, values: [id] })
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
}

export default databaseMethods
