import DBConnect from '../../src/components/databaseConnect'

const databaseMethods = {
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
  getIncompleteReviewAssignments: async () => {
    const data = await DBConnect.gqlQuery(`
      query getIncompleteReviewAssignments {
        reviewAssignments(
          condition: { status: ASSIGNED }
          filter: { assignedSections: { equalTo: [] } }
        ) {
          nodes {
            id
            assignedSections
            reviewQuestionAssignments {
              nodes {
                templateElement {
                  section {
                    id
                    code
                  }
                }
              }
            }
          }
        }
      }`)
    return data?.reviewAssignments?.nodes
  },
  addAssignedSections: async (sectionAssignments: any) => {
    try {
      sectionAssignments.forEach(async (sa: any) => {
        const text = `
        UPDATE review_assignment
        SET assigned_sections = $1
        WHERE id = $2
        `
        await DBConnect.query({ text, values: [sa.assignedSections, sa.id] })
      })
    } catch (err) {
      throw err
    }
  },
}

export default databaseMethods
