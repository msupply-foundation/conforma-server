const databaseMethods = (DBConnect: any) => ({
  getAllApplicationResponses: async (applicationId: number) => {
    const text = `
    SELECT ar.id, template_element_id, code, value, time_updated
    FROM application_response ar JOIN template_element te
    ON ar.template_element_id = te.id
    WHERE application_id = $1
    ORDER BY time_updated
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationId] })
      const responses = result.rows
      return responses
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getAllReviewResponses: async (reviewId: number) => {
    const text = `
    SELECT rr.id, r.level, code, comment, decision,
    rr.application_response_id, rr.review_response_link_id, rr.time_updated
    FROM review_response rr JOIN application_response ar
    ON rr.application_response_id = ar.id
    JOIN template_element te ON ar.template_element_id = te.id
    JOIN review r ON rr.review_id = r.id
    WHERE review_id = $1
    ORDER BY time_updated
    `
    try {
      const result = await DBConnect.query({ text, values: [reviewId] })
      const responses = result.rows
      return responses
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  deleteApplicationResponses: async (responsesToDelete: number[]) => {
    const text = `DELETE from application_response
      WHERE id = ANY ($1)
      RETURNING (SELECT code FROM
      template_element WHERE id = template_element_id)
      `
    try {
      const result = await DBConnect.query({ text, values: [responsesToDelete] })
      return result.rows.map((row: { code: string }) => row.code)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  deleteReviewResponses: async (responsesToDelete: number[]) => {
    const text = `DELETE from review_response
      WHERE id = ANY ($1)
      RETURNING (SELECT code FROM
        application_response JOIN template_element
        ON template_element_id = template_element.id
        WHERE application_response.id = application_response_id)
      `
    try {
      const result = await DBConnect.query({ text, values: [responsesToDelete] })
      return result.rows.map((row: { code: string }) => row.code)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  updateApplicationResponseTimestamps: async (responsesToUpdate: number[], timestamp: string) => {
    const text = `UPDATE application_response
      SET time_updated = $1
      WHERE id = ANY ($2)
      RETURNING (SELECT code FROM
        template_element WHERE id = template_element_id)
      `
    try {
      const result = await DBConnect.query({ text, values: [timestamp, responsesToUpdate] })
      return result.rows.map((row: { code: string }) => row.code)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  updateReviewResponseTimestamps: async (responsesToUpdate: number[], timestamp: string) => {
    const text = `UPDATE review_response
      SET time_updated = $1
      WHERE id = ANY ($2)
      RETURNING (SELECT code FROM
        application_response JOIN template_element
        ON template_element_id = template_element.id
        WHERE application_response.id = application_response_id)
      `
    try {
      const result = await DBConnect.query({ text, values: [timestamp, responsesToUpdate] })
      return result.rows.map((row: { code: string }) => row.code)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
