import DBConnect from '../database/databaseConnect'
import { errorMessage, isObject } from '../../components/utilityFunctions'
import { CombinedLinkedEntities, PgDataTable, PgDataView } from './types'
import { ApiError } from './ApiError'

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
    value: number | string | (number | string)[],
    field: string | string[] = 'id'
  ): Promise<T> => {
    try {
      const text = Array.isArray(field)
        ? `SELECT * FROM ${tableName} WHERE ${field
            .map((val, index) =>
              index === 0 ? `${val} = $${index + 1}` : `AND ${val} = $${index + 1}`
            )
            .join(' ')}`
        : `SELECT * FROM ${tableName} WHERE ${field} = $1`

      const result = await DBConnect.query({
        text,
        values: Array.isArray(value) ? [...value] : [value],
      })
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
  getJoinedEntities: async <T>(input: {
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
  getFilesFromDocAction: async (templateId: number): Promise<string[]> => {
    const text = `
      SELECT DISTINCT parameter_queries->>'docTemplateId' AS file_id
      FROM template_action
      WHERE template_id = $1
      AND action_code = 'generateDoc'
    `
    try {
      const result = await DBConnect.query({ text, values: [templateId], rowMode: 'array' })
      return result.rows.flat()
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getDataTablesFromModifyRecord: async (templateId: number): Promise<string[]> => {
    const text = `
      SELECT DISTINCT parameter_queries->>'tableName' as data_table
      FROM public.template_action
      WHERE template_id = $1
      AND action_code = 'modifyRecord'
    `
    try {
      const result = await DBConnect.query({ text, values: [templateId], rowMode: 'array' })
      return result.rows.flat()
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getLinkedDataTables: async (tableNames: string[]): Promise<PgDataTable[]> => {
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
    entityData: CombinedLinkedEntities
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
  insertRecord: async <T>(tableName: string, data: T) => {
    if (!isObject(data)) throw new ApiError("Cannot insert data that isn't an Object", 500)
    const fields = Object.keys(data)
    const fieldsString = fields.join(', ')
    const values = Object.values(data).map((value, index) =>
      DBConnect.isJsonColumn(tableName, fields[index]) ? JSON.stringify(value) : value
    )
    try {
      const text = `
        INSERT INTO ${tableName}
          (${fieldsString})
        VALUES (${DBConnect.getValuesPlaceholders(values)})
        RETURNING id;`
      const result = await DBConnect.query({ text, values })
      return result.rows[0].id
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  updateRecord: async (
    tableName: string,
    patch: Record<string, unknown>,
    matchField: string = 'id'
  ) => {
    const fields: string[] = []
    const values: unknown[] = []
    Object.entries(patch).forEach(([key, value], index) => {
      fields.push(`"${key}" = $${index + 1}`)

      if (DBConnect.isJsonColumn(tableName, key)) values.push(JSON.stringify(value))
      else values.push(value)
    })
    const matchValueText =
      typeof patch[matchField] === 'number' ? patch[matchField] : `'${patch[matchField]}'`

    const text = `UPDATE ${tableName} SET ${fields.join(
      ', '
    )} WHERE ${matchField} = ${matchValueText}`
    await DBConnect.query({ text, values })
  },
  getNextDraftVersionId: async (code: string) => {
    const text = `
      SELECT version_id FROM template
        WHERE code = $1
        AND version_id LIKE '*%'
    `
    try {
      const draftVersions = (
        await DBConnect.query({ text, values: [code], rowMode: 'array' })
      ).rows.flat()
      if (!draftVersions.includes('*')) return '*'
      let i = 1
      let nextDraftVersionId: string | null = null
      while (nextDraftVersionId === null) {
        if (draftVersions.includes(`*_${i}`)) {
          i++
          continue
        }
        nextDraftVersionId = `*_${i}`
      }
      return nextDraftVersionId
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getAllDataViews: async (): Promise<PgDataView[]> => {
    const text = `
      SELECT *
      FROM data_view
      ORDER BY table_name;
    `
    try {
      const result = await DBConnect.query({ text })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getAllAccessibleDataViews: async (permissions: string[]): Promise<PgDataView[]> => {
    const text = `
      SELECT *
      FROM data_view
      WHERE $1 && permission_names
      OR array_length(permission_names, 1) IS NULL;
    `
    try {
      const result = await DBConnect.query({ text, values: [permissions] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getDataViewsUsingTables: async (tables: string[]): Promise<PgDataView[]> => {
    const text = `
        SELECT *
          FROM data_view
          WHERE table_name = ANY($1);
    `
    try {
      const result = await DBConnect.query({ text, values: [tables] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getApplyPermissionsForTemplate: async (templateId: number): Promise<string[]> => {
    const text = `
      SELECT DISTINCT "permissionName" FROM public.permissions_all
        WHERE "templateId" = $1
        AND "permissionType" = 'APPLY'
    `
    try {
      const result = await DBConnect.query({ text, values: [templateId], rowMode: 'array' })
      return result.rows.flat()
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getTemplateElementCountUsingDataView: async (templateId: number, dataViewCode: string) => {
    const text = `
      WITH a AS (SELECT '%/data-views/${dataViewCode}%' as val)
        SELECT COUNT(*) FROM public.template_element
          WHERE (parameters::text LIKE (SELECT val FROM a)
          OR visibility_condition::text LIKE (SELECT val FROM a)
          OR is_required::text LIKE (SELECT val FROM a)
          OR is_editable::text LIKE (SELECT val FROM a))
          AND section_id IN (
            SELECT id FROM template_section
            WHERE template_id = $1
          )
    `
    try {
      const result = await DBConnect.query({ text, values: [templateId] })
      return result.rows[0].count
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
}

export default databaseMethods
