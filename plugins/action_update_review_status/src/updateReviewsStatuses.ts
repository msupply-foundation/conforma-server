import {
  ActionQueueStatus,
  Decision,
  ReviewResponseDecision,
  ReviewStatus,
} from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'

type TriggeredBy = 'REVIEW' | 'APPLICATION'
interface Review {
  reviewId: number
  reviewAssignmentId: number
  applicationId: number
  reviewerId: number
  levelNumber: number
  reviewStatus: ReviewStatus
}

interface ReviewAssignment {
  reviewAssignmentId: number
  isLocked: boolean
}

const updateReviewsStatuses: ActionPluginType = async ({
  parameters,
  applicationData,
  DBConnect,
}) => {
  const db = databaseMethods(DBConnect)

  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  const decision = applicationData?.reviewData?.latestDecision?.decision || Decision.NoDecision
  const isLastLevel = applicationData?.reviewData?.isLastLevel || false

  const stageId = parameters?.stageId || applicationData?.stageId
  const currentReviewLevel = parameters.level || applicationData?.reviewData?.levelNumber || 0
  const previousLevelReview = currentReviewLevel > 0 ? currentReviewLevel - 1 : 1
  const changedResponses = parameters.changedResponses || []
  const triggeredBy: TriggeredBy = parameters.triggeredBy || 'APPLICATION'

  console.log(
    'Updating statuses of reviews associated with ' + triggeredBy === 'REVIEW'
      ? 'review Id: ' + reviewId
      : 'application Id: ' + applicationId
  )

  console.log('Current review level:', currentReviewLevel)
  console.log('Changed responses:', changedResponses)

  const reviewsToUpdate = []
  const reviewAssignmentsToUpdate: ReviewAssignment[] = []

  const getReviewsByLevelAndStatus = async (
    level: number,
    statusToUpdate?: ReviewStatus[]
  ): Promise<Review[]> =>
    (await db.getAssociatedReviews(applicationId, stageId, level)).filter(
      (review: Review) =>
        review.reviewId !== reviewId &&
        (!statusToUpdate || statusToUpdate.includes(review.reviewStatus))
    )

  const getReviewAssignmentsWithoutReviewByLevel = async (
    level: number
  ): Promise<ReviewAssignment[]> =>
    await db.getAssociatedReviewAssignmentNotStarted(applicationId, stageId, level)

  console.log('Finding reviews to update status...')

  try {
    if (triggeredBy === 'REVIEW') {
      // Review submitted from upper level to lower level review
      if (decision === Decision.ChangesRequested) {
        // Update lower level reviews with assigned responses on the array changed responses ...
        const reviewsSubmitted = await getReviewsByLevelAndStatus(previousLevelReview, [
          ReviewStatus.Submitted,
        ])
        // Deduce which ones should be updated to Pending
        for (const review of reviewsSubmitted) {
          const { reviewAssignmentId } = review
          if (await haveAssignedResponsesChanged(reviewAssignmentId))
            reviewsToUpdate.push({ ...review, reviewStatus: ReviewStatus.ChangesRequested })
        }
      } else if (isLastLevel) {
        // Review submitted by last level reviewer to applicant

        // Get all reviews matching application_id, current stage and previous level with Draft status
        const reviewsLocked = await getReviewsByLevelAndStatus(previousLevelReview, [
          ReviewStatus.Draft,
        ])

        // Lock reviews to avoid other reviews submitted while awaiting changes required to applicant
        reviewsLocked.forEach((review) => {
          reviewsToUpdate.push({ ...review, reviewStatus: ReviewStatus.Locked })
          // TODO: Check with team should also lock the reviewAssignment ?
        })

        // Get all reviewAssignments without review on previous level
        const assignmentsWithoutReviews = await getReviewAssignmentsWithoutReviewByLevel(
          previousLevelReview
        )

        // Lock reviewAssignment - which will still allow creating the review, but with status LOCKED
        assignmentsWithoutReviews.forEach(({ reviewAssignmentId, isLocked }) => {
          if (!isLocked) reviewAssignmentsToUpdate.push({ reviewAssignmentId, isLocked: true })
        })
      } else {
        // Review submitted from lower level to upper level

        // Update upper level reviews submitted
        const nextReviewLevel = currentReviewLevel + 1
        const upperLevelReviews = await getReviewsByLevelAndStatus(nextReviewLevel, [
          ReviewStatus.Submitted,
          ReviewStatus.Draft,
        ])

        // NOTE: Not checking if assigned questions since consolidation cannot be partial!
        upperLevelReviews.forEach((review) =>
          reviewsToUpdate.push({ ...review, reviewStatus: ReviewStatus.Pending })
        )
      }
    } else {
      // For Application submission

      // Get reviews matching application_id, current stage, in level 1
      const level = 1
      const reviews = await getReviewsByLevelAndStatus(level)
      // Deduce which ones should be updated to Pending
      for (const review of reviews) {
        const { reviewAssignmentId, reviewStatus } = review
        if (reviewStatus === ReviewStatus.Locked) {
          // TODO: Check with team should also lock the reviewAssignment ?
        }
        if (await haveAssignedResponsesChanged(reviewAssignmentId))
          reviewsToUpdate.push({ ...review, reviewStatus: ReviewStatus.Pending })
        else if (reviewStatus === ReviewStatus.Locked)
          reviewsToUpdate.push({ ...review, reviewStatus: ReviewStatus.Pending })
      }
    }

    // Update review statuses
    for (const review of reviewsToUpdate) {
      const { reviewId, reviewStatus } = review
      await DBConnect.addNewReviewStatusHistory(reviewId, reviewStatus)
    }

    console.log('Resulting reviews assignments to update', reviewAssignmentsToUpdate)

    // Update review assignments locked/unlocked
    for (const reviewAssignment of reviewAssignmentsToUpdate) {
      const { reviewAssignmentId, isLocked } = reviewAssignment
      await db.setReviewAssignmentIsLocked(reviewAssignmentId, isLocked)
    }

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        updatedReviews: reviewsToUpdate,
        updatedReviewAssignments: reviewAssignmentsToUpdate,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem updating review statuses.',
    }
  }

  async function haveAssignedResponsesChanged(reviewAssignmentId: number) {
    const questionAssignments = await db.getReviewAssignedElementIds(reviewAssignmentId)

    return changedResponses.some(({ templateElementId, reviewResponseDecision }: any) => {
      const assignedResponse = questionAssignments.includes(templateElementId)
      if (triggeredBy === 'REVIEW')
        return reviewResponseDecision === ReviewResponseDecision.Disagree && assignedResponse
      // triggeredBy === 'APPLICATION'
      return assignedResponse
    })
  }
}

export default updateReviewsStatuses
