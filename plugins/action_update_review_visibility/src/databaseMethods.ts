const databaseMethods = (DBConnect: any) => ({
  updateReviewResponseVisibility: async (reviewId: number) => {
    const text = `
    UPDATE review_response 
    SET is_visible_to_applicant = true 
    WHERE id IN (
      SELECT original_response.id 
      FROM review_response current_review_response 
      JOIN review_response original_response 
        ON current_review_response.original_review_response_id = original_response.id 
    WHERE current_review_response.recommended_applicant_visibility = 'ORIGINAL_RESPONSE_VISIBLE_TO_APPLICANT'
    AND current_review_response.review_id = $1)
    RETURNING id
    `
    try {
      return await DBConnect.query({ text, values: [reviewId] })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
