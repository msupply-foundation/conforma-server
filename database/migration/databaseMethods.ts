import DBConnect from '../../src/components/databaseConnect'

const databaseMethods = {
  // Use this method for schema changes, doesn't throw error, just prints
  // message to console (for when schema is already changed)
  changeSchema: async (query: string) => {
    try {
      await DBConnect.query({ text: query })
    } catch (err) {
      console.log('Problem altering schema:', err.message, '\n')
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
      throw err
    }
  },
  insertDataTable: async (
    tableName: string,
    name: string,
    fieldMap: string,
    isLookupTable: boolean
  ) => {
    const text = `INSERT INTO data (table_name, name, field_map, is_lookup_table) VALUES($1, $2, $3, $4)`
    try {
      const result = await DBConnect.query({
        text,
        values: [tableName, name, fieldMap, isLookupTable],
      })
      return result.rows[0]
    } catch (err) {
      // Table record already exists, probably
      console.log(err.message)
    }
  },
}

export default databaseMethods
