const databaseMethods = (DBConnect: any) => ({
  getAllApplicationResponses: async (applicationId: number) => {
    const text = `
    SELECT ar.id, code, value, time_created
    FROM application_response ar JOIN template_element te
    ON ar.template_element_id = te.id
    WHERE application_id = $1
    ORDER BY time_created
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
    SELECT rr.id, code, comment, decision, rr.time_created
    FROM review_response rr JOIN application_response ar
    ON rr.application_response_id = ar.id
    JOIN template_element te ON ar.template_element_id = te.id
    WHERE review_id = $1
    ORDER BY time_created
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
})

export default databaseMethods
