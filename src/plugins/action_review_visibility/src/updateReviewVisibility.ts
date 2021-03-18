import databaseMethods from './databaseMethods'

module.exports['updateReviewVisibility'] = async function ({ reviewId }: any, DBConnect: any) {
  console.log('Updating review visibility...')
  const db = databaseMethods(DBConnect)

  try {
    const queryResult = await db.updateReviewResponseVisibility(reviewId)
    const reviewResponsesWithUpdatedVisibility = queryResult.rows.map(
      (row: { id: number }) => row.id
    )
    console.log(
      'Updated visiblity of review responses with ids - ',
      reviewResponsesWithUpdatedVisibility
    )
    return {
      status: 'Success',
      error_log: '',
      output: {
        reviewResponsesWithUpdatedVisibility,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Problem updating review_visibility records.',
    }
  }
}
