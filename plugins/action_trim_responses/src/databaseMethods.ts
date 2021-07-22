const databaseMethods = (DBConnect: any) => ({
  deleteApplicationResponses: async (responsesToDelete: number[]) => {
    const text = `DELETE from application_response
      WHERE id = ANY ($1)
      RETURNING id AS "applicationResponseId",
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
  // use applicationId for time_submitted timestamp from latest application_stage_status_latest
  updateApplicationResponseSubmittedTimestamps: async (
    responsesToUpdate: number[],
    applicationId: string
  ) => {
    const text = `UPDATE application_response
      SET time_submitted = (select status_history_time_created from application_stage_status_latest where application_id = $1)
      WHERE id = ANY ($2)
      RETURNING id AS "applicationResponseId",
      template_element_id AS "templateElementId"
      `
    try {
      const result = await DBConnect.query({ text, values: [applicationId, responsesToUpdate] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  // use reviewId for time_submitted timestamp from latest review_status_history
  updateReviewResponseSubmittedTimestamps: async (
    responsesToUpdate: number[],
    reviewId: number
  ) => {
    const text = `UPDATE review_response
      SET time_submitted = (select time_created from review_status_history where review_id = $1 and is_current = true)
      WHERE id = ANY ($2)
      RETURNING 
        id AS "reviewResponseId",
        decision AS "reviewResponseDecision",
        template_element_id AS "templateElementId"
      `
    try {
      const result = await DBConnect.query({ text, values: [reviewId, responsesToUpdate] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
