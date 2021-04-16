const databaseMethods = (DBConnect: any) => ({
  getAssociatedReviews: async (applicationId: number, stageId: number, level: number) => {
    const text = `
    SELECT
      review.id AS "reviewId",
      review_assignment_id AS "reviewAssignmentId",
      review_assignment.application_id AS "applicationId",
      review_assignment.reviewer_id,
      review_assignment.level_number AS "levelNumber",
      review_assignment.id AS "reviewAssignmentId",
      review_status_history.status AS "reviewStatus"
      FROM review JOIN review_assignment
      ON review.review_assignment_id = review_assignment.id
      JOIN review_status_history ON review.id = review_status_history.review_id
      WHERE review_status_history.is_current = true
      AND review_assignment.application_id = $1
      AND stage_id = $2
      AND review_assignment.level_number = $3
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationId, stageId, level] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getReviewAssignedElementIds: async (reviewAssignmentId: number) => {
    const text = `
    SELECT template_element_id AS "templateElementId"
    FROM review_question_assignment
    WHERE review_assignment_id = $1
    `
    try {
      const result = await DBConnect.query({ text, values: [reviewAssignmentId] })
      return result.rows.map(({ templateElementId }: any) => templateElementId)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
