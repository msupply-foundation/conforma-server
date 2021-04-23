import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'

type ReviewStatus = 'Draft' | 'Submitted' | 'Changes Requested' | 'Pending' | 'Locked'
interface Review {
  reviewId: number
  reviewAssignmentId: number
  applicationId: number
  reviewerId: number
  levelNumber: number
  reviewStatus: ReviewStatus
}

async function updateReviews({ parameters, applicationData, DBConnect }: ActionPluginInput) {
  const db = databaseMethods(DBConnect)

  console.log('Updating reviews status...')

  const applicationId = parameters?.applicationId ?? applicationData?.applicationId

  const { changedApplicationResponses = [] } = parameters
  const stageId = parameters?.stageId || applicationData?.stageId
  const level = parameters?.level || applicationData?.reviewData?.levelNumber || 1

  const reviewsToUpdate = []

  console.log('changedApplicationResponses', changedApplicationResponses)

  try {
    // Get reviews/review assignments (with status) matching application_id & current stage
    const reviews = (
      await db.getAssociatedReviews(applicationId, stageId, level)
    ).filter((review: Review) => ['Submitted', 'Locked', 'Draft'].includes(review.reviewStatus))
    // Deduce which ones should be updated
    for (const review of reviews) {
      const { reviewAssignmentId, levelNumber, reviewStatus } = review
      if (levelNumber > 1) reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
      else if (await haveAssignedResponsesChanged(reviewAssignmentId))
        reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
      else if (reviewStatus === 'Locked')
        reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
    }
    console.log('reviewsToUpdate', reviewsToUpdate)

    // Update review statuses
    for (const review of reviewsToUpdate) {
      const { reviewId, reviewStatus } = review
      DBConnect.addNewReviewStatusHistory(reviewId, reviewStatus)
    }

    return {
      status: 'Success',
      error_log: '',
      output: {
        updatedReviews: reviewsToUpdate,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem updating review statuses.',
    }
  }

  async function haveAssignedResponsesChanged(reviewAssignmentId: number) {
    const questionAssignments = await db.getReviewAssignedElementIds(reviewAssignmentId)
    return changedApplicationResponses.reduce(
      (isInAssigned: boolean, { templateElementId }: any) => {
        return isInAssigned || questionAssignments.includes(templateElementId)
      },
      false
    )
  }
}

export default updateReviews
