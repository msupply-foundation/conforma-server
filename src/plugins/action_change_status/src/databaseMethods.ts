const databaseMethods = (DBConnect: any) => ({
  getApplicationCurrentStatusHistory: async (applicationId: number) => {
    const text = `SELECT id, status, application_stage_history_id FROM
      application_status_history WHERE
      application_id = $1 and is_current = true;`
    try {
      const result = await DBConnect.query({ text, values: [applicationId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },

  getReviewCurrentStatusHistory: async (reviewId: number) => {
    const text = `SELECT id, status FROM
      review_status_history WHERE
      review_id = $1 and is_current = true;`
    try {
      const result = await DBConnect.query({ text, values: [reviewId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },

  addNewReviewStatusHistory: async (reviewId: number, status = 'Draft') => {
    // Note: switching is_current of previous status_histories to False is done automatically by a Postgres trigger function
    const text =
      'INSERT into review_status_history (review_id, status) VALUES ($1, $2) RETURNING id, status'
    try {
      const result = await DBConnect.query({ text, values: [reviewId, status] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
