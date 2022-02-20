import DBConnect from '../../src/components/databaseConnect'

const databaseMethods = {
  // Use this method when there's no variables to parse, save making loads of
  // methods for minor schema alterations
  rawQuery: async (query: string) => {
    try {
      await DBConnect.query({ text: query })
    } catch (err) {
      throw err
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
    console.log('Setting...')
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
}

export default databaseMethods
