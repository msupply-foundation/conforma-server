import databaseMethods from './databaseMethods'
import { ActionPluginType } from '../../types'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { errorMessage } from '../../../src/components/utilityFunctions'

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
      'Updated visibility of review responses with ids - ',
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
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem updating review_visibility records.',
    }
  }
}

export default updateReviewVisibility
