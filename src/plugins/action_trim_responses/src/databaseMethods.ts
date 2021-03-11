const databaseMethods = (DBConnect: any) => ({
  deleteApplicationResponses: async (responsesToDelete: number[]) => {
    const text = `DELETE from application_response
      WHERE id = ANY ($1)
      RETURNING id AS "applicationResponseId",
      template_element_id AS "templateElementID"
      `
    try {
      const result = await DBConnect.query({ text, values: [responsesToDelete] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  deleteReviewResponses: async (responsesToDelete: number[]) => {
    const text = `DELETE from review_response
      WHERE id = ANY ($1)
      RETURNING id AS "reviewResponseId",
      template_element_id AS "templateElementId"
      `
    try {
      const result = await DBConnect.query({ text, values: [responsesToDelete] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  updateApplicationResponseTimestamps: async (responsesToUpdate: number[], timestamp: string) => {
    const text = `UPDATE application_response
      SET time_updated = $1
      WHERE id = ANY ($2)
      RETURNING id AS "applicationResponseId",
      template_element_id AS "templateElementID"
      `
    try {
      const result = await DBConnect.query({ text, values: [timestamp, responsesToUpdate] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  updateReviewResponseTimestamps: async (responsesToUpdate: number[], timestamp: string) => {
    const text = `UPDATE review_response
      SET time_updated = $1
      WHERE id = ANY ($2)
      RETURNING id AS "reviewResponseId",
      template_element_id AS "templateElementId"
      `
    try {
      const result = await DBConnect.query({ text, values: [timestamp, responsesToUpdate] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
