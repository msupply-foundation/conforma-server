import path from 'path'
import DBConnect from '../../src/components/databaseConnect'
import { getTemplateVersionId } from '../../src/components/exportAndImport/helpers'
import { FILES_FOLDER } from '../../src/constants'
import fs from 'fs/promises'

type SchemaQueryOptions = {
  silent: boolean
}

const databaseMethods = {
  // Use this method for schema changes, doesn't throw error, just prints
  // message to console (for when schema is already changed)
  changeSchema: async (query: string, options?: SchemaQueryOptions) => {
    try {
      await DBConnect.query({ text: query })
    } catch (err) {
      if (!options?.silent) console.log('Problem altering schema:', err.message, '\n')
    }
  },
  getDatabaseVersion: async () => {
    const text = `SELECT name, value, timestamp
      FROM system_info
      WHERE timestamp =
        (SELECT MAX(timestamp) FROM system_info
        WHERE name='version')
       `
    try {
      const result = await DBConnect.query({ text })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  setDatabaseVersion: async (version: string) => {
    const text = `
      INSERT INTO system_info (name, value)
      VALUES('version', $1)
      `
    try {
      await DBConnect.query({ text, values: [`"${version}"`] })
    } catch (err) {
      throw err
    }
  },
  checkColumnExists: async (tableName: string, columnName: string) => {
    const text = `
      SELECT COUNT(*) FROM public.schema_columns 
      where table_name = $1
      AND column_name = $2;
    `
    const result = await DBConnect.query({ text, values: [tableName, columnName] })
    return result.rows[0].count > 0
  },
  addAssignedSectionsColumn: async () => {
    const text = `ALTER TABLE review_assignment
        ADD COLUMN assigned_sections varchar[] DEFAULT array[]::varchar[];`
    try {
      await DBConnect.query({ text })
    } catch (err) {
      throw err
    }
  },
  getIncompleteReviewAssignments: async () => {
    const text = `
      SELECT ra.id, status, assigned_sections, ts.code FROM review_assignment ra
      JOIN review_question_assignment rqa ON 
      ra.id = rqa.review_assignment_id
      JOIN template_element te ON rqa.template_element_id = te.id
      JOIN template_section ts ON te.section_id = ts.id
      WHERE status <> 'AVAILABLE'
      AND assigned_sections = '{}'
      ORDER BY ra.id
    `
    try {
      const result = await DBConnect.query({ text })
      return result.rows
    } catch (err) {
      throw err
    }
  },
  addAssignedSections: async (sectionAssignments: { id: number; assignedSections: string[] }[]) => {
    try {
      for (const sa of sectionAssignments) {
        const text = `
        UPDATE review_assignment
        SET assigned_sections = $1
        WHERE id = $2
        `
        await DBConnect.query({ text, values: [sa.assignedSections, sa.id] })
      }
    } catch (err) {
      throw err
    }
  },
  getLookupTableData: async () => {
    const text = `SELECT * FROM lookup_table`
    try {
      const result = await DBConnect.query({ text })
      return result.rows
    } catch (err) {
      // Lookup table probably already deleted
      console.log(err.message)
    }
  },
  insertDataTable: async (
    tableName: string,
    displayName: string,
    fieldMap: string,
    isLookupTable: boolean
  ) => {
    const text = `INSERT INTO data_table (table_name, display_name, field_map, is_lookup_table) VALUES($1, $2, $3, $4)`
    try {
      const result = await DBConnect.query({
        text,
        values: [tableName, displayName, fieldMap, isLookupTable],
      })
      return result.rows[0]
    } catch (err) {
      // Table record already exists, probably
      console.log(err.message)
    }
  },
  populateQueueApplicationIds: async (tableName: 'trigger_queue' | 'action_queue') => {
    const count = (await DBConnect.query({ text: `SELECT MAX(id) FROM ${tableName};` })).rows[0].max

    // This is duplicated in the later functions script, but we need it here
    // now, otherwise there'll be no application_id data in the review table.
    await DBConnect.query({
      text: `
      ALTER TABLE public.review
        DROP COLUMN IF EXISTS application_id CASCADE,
        ADD COLUMN IF NOT EXISTS application_id integer GENERATED ALWAYS AS (public.review_application_id (review_assignment_id)) STORED REFERENCES public.application (id) ON DELETE CASCADE;
      `,
    })

    for (let id = 1; id <= count; id++) {
      const trigger_data =
        tableName === 'trigger_queue'
          ? (
              await DBConnect.query({
                text: 'SELECT "table", record_id FROM trigger_queue WHERE id = $1',
                values: [id],
              })
            ).rows[0]
          : (
              await DBConnect.query({
                text: 'SELECT trigger_payload FROM action_queue WHERE id = $1',
                values: [id],
              })
            ).rows[0]?.trigger_payload

      if (!trigger_data) continue

      const { table, record_id } = trigger_data

      try {
        const application_id = await DBConnect.getApplicationIdFromTrigger(table, record_id)
        await DBConnect.query({
          text: `UPDATE ${tableName} SET application_id = $1 WHERE id = $2`,
          values: [application_id, id],
        })
      } catch {
        // Application no longer exists, so delete the queue record
        await DBConnect.query({
          text: `DELETE FROM ${tableName} WHERE id = $1`,
          values: [id],
        })
      }
    }
  },
  migrateTemplateVersions: async () => {
    // Get all templates
    let result
    try {
      result = await DBConnect.query({
        text: `SELECT id, code, version, version_timestamp, version_id FROM template`,
      })
    } catch {
      // This will fail if the "version" column has already been deleted in an
      // earlier migration run
      console.log('...Template versions already migrated')
      return
    }

    const allTemplates = result?.rows ?? []

    if (allTemplates.every((template) => template.version_id !== null)) {
      console.log('...Template versions already migrated')
      return
    }

    // Get unique codes
    const templateCodes = Array.from(new Set(allTemplates.map((t) => t.code)))

    // Iterate over codes
    for (const code of templateCodes) {
      const templates = allTemplates
        .filter((t) => t.code === code)
        .sort((a, b) => a.version - b.version)

      const versionHistory: {
        versionId: string
        timestamp: string
        parentVersionId: string | null
        comment: string | null
      }[] = []

      for (const template of templates) {
        const versionId = getTemplateVersionId()
        const timestamp = template.version_timestamp.toISOString()
        const parentVersionId = versionHistory.slice(-1)?.[0]?.versionId ?? null
        const comment = `New version: ${versionId}`
        const historyObject = { versionId, timestamp, parentVersionId, comment }

        const text = `UPDATE template SET version_id = $1,
          parent_version_id = $2,
          version_history = $3
          WHERE id = $4`

        await DBConnect.query({
          text,
          values: [versionId, parentVersionId, JSON.stringify(versionHistory), template.id],
        })
        versionHistory.push(historyObject)
      }
    }
  },
  updateFileSizes: async () => {
    const files = (
      await DBConnect.query({
        text: `SELECT id, archive_path, file_path FROM file
        WHERE file_size IS NULL;`,
      })
    ).rows

    for (const file of files) {
      const fileId = file.id
      const archivePath = file.archive_path ?? ''
      const filePath = file.file_path
      const fullPath = path.join(FILES_FOLDER, archivePath, filePath)
      try {
        const size = (await fs.stat(fullPath)).size

        await DBConnect.query({
          text: `UPDATE file SET file_size = $1
          WHERE id = $2`,
          values: [size, fileId],
        })
      } catch {
        console.log('Problem updating file size for:', fullPath)
      }
    }
  },
}

export default databaseMethods
