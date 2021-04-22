import databaseMethods from './databaseMethods'
import { ActionPluginInput } from '../../types'

async function updateReviewVisibility({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput) {
  console.log('Updating review visibility...')
  const db = databaseMethods(DBConnect)

  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId

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

export default updateReviewVisibility
