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
    return 'OK'
  },
  deleteReviewResponses: async (responsesToDelete: number[]) => {
    return 'Fine'
  },
})

export default databaseMethods
