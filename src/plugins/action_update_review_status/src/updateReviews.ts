import databaseMethods from './databaseMethods'

type ReviewStatus = 'Draft' | 'Submitted' | 'Changes Requested' | 'Pending' | 'Locked'
interface Review {
  reviewId: number
  reviewAssignmentId: number
  applicationId: number
  reviewerId: number
  level: number
  reviewStatus: ReviewStatus
}

module.exports['updateReviews'] = async function (input: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)

  console.log('Updating reviews status...')

  const { applicationId, applicationData, changedApplicationResponses = [] } = input

  const stageId = input?.stageId || applicationData.stageId

  const reviewsToUpdate = []

  console.log('changedApplicationResponses', changedApplicationResponses)

  try {
    // Get reviews/review assignments (with status) matching application_id & current stage
    const reviews = (
      await db.getAssociatedReviews(applicationId, stageId)
    ).filter((review: Review) => ['Submitted', 'Locked', 'Draft'].includes(review.reviewStatus))
    // Deduce which ones should be updated
    for (const review of reviews) {
      const { reviewAssignmentId, level, reviewStatus } = review
      if (level > 1) reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
      else if (await haveAssignedResponsesChanged(reviewAssignmentId))
        reviewsToUpdate.push({ ...review, reviewStatus: 'Pending' })
      else if (reviewStatus === 'Pending' || reviewStatus === 'Locked')
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
    const questionAssignments = await db.getReviewQuestionAssignments(reviewAssignmentId)
    return changedApplicationResponses.reduce(
      (isInAssigned: boolean, { templateElementId }: any) => {
        return isInAssigned || questionAssignments.includes(templateElementId)
      },
      false
    )
  }
}
