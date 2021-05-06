import databaseMethods from './databaseMethods'
import { ActionPluginType } from '../../types'
import { ActionQueueStatus } from '../../../src/generated/graphql'

const updateReviewVisibility: ActionPluginType = async ({
  parameters,
  applicationData,
  DBConnect,
}) => {
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
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewResponsesWithUpdatedVisibility,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem updating review_visibility records.',
    }
  }
}

export default updateReviewVisibility
