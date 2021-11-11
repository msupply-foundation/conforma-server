const databaseMethods = (DBConnect: any) => ({
  getReviewAssignmentById: async (reviewAssignmentId: number) => {
    const text = `
        SELECT * FROM review_assignment
        WHERE id = $1
        `
    try {
      const result = await DBConnect.query({
        text,
        values: [reviewAssignmentId],
      })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getMatchingReviewAssignments: async (
    reviewAssignmentId: number,
    applicationId: number,
    stageNumber: number,
    reviewLevel: number,
    isSelfAssignable: boolean
  ) => {
    const text = `
    SELECT * FROM review_assignment
    WHERE application_id = $2
    AND stage_number = $3
    AND level_number = $4
    AND is_self_assignable = $5
    AND id <> $1
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [reviewAssignmentId, applicationId, stageNumber, reviewLevel, isSelfAssignable],
      })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  updateReviewAssignments: async (reviewAssignments: any) => {
    const reviewAssignmentUpdateResults = []
    for (const reviewAssignment of reviewAssignments) {
      const { id, isLocked } = reviewAssignment
      const text = `
      UPDATE review_assignment
      SET is_locked = $2
      WHERE id = $1
      RETURNING id, is_locked
      `
      try {
        const result = await DBConnect.query({
          text,
          values: [id, isLocked],
        })
        reviewAssignmentUpdateResults.push(result.rows[0])
      } catch (err) {
        console.log(err.message)
        reviewAssignmentUpdateResults.push(err.message)
        throw err
      }
    }
    return reviewAssignmentUpdateResults
  },
})

export default databaseMethods
