import {
  ActionQueueStatus,
  ReviewResponseDecision,
  ReviewStatus,
} from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import { action as changeStatus } from '../../action_change_status/src'
import { errorMessage } from '../../../src/components/utilityFunctions'

type TriggeredBy = 'REVIEW' | 'APPLICATION'
export interface Review {
  reviewId: number
  reviewAssignmentId: number
  applicationId: number
  reviewerId: number
  levelNumber: number
  assignedSections: string[]
  reviewStatus: ReviewStatus
}
interface ChangedApplicationResponse {
  applicationResponseId: number
  templateElementId: number
}

interface ChangedReviewResponse {
  reviewResponseId: number
  reviewResponseDecision: ReviewResponseDecision
  templateElementId: number
}

type ChangedResponse = ChangedApplicationResponse | ChangedReviewResponse

const updateReviewStatuses: ActionPluginType = async ({
  parameters,
  applicationData,
  DBConnect,
}) => {
  const db = databaseMethods(DBConnect)

  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  const stageNumber = parameters?.stageNumber || applicationData?.stageNumber

  // Changed responses normally come from the output of the "trimResponses"
  // action
  const changedResponses: ChangedResponse[] = parameters.changedResponses || []

  const triggeredBy: TriggeredBy = reviewId ? 'REVIEW' : parameters.triggeredBy || 'APPLICATION'
  // `triggeredBy` parameter deprecated

  console.log(
    `Updating statuses of reviews associated with ${
      triggeredBy === 'REVIEW' ? 'review Id: ' + reviewId : 'application Id: ' + applicationId
    }`
  )

  try {
    // Get all reviews for this application/stage. We do additional filtering
    // (e.g for review level) as required further on.
    const reviews = (await db.getAssociatedReviews(applicationId, stageNumber))
      // Ignore all "Discontinued" reviews
      .filter(({ reviewStatus }) => reviewStatus !== ReviewStatus.Discontinued)

    // APPLICATION SUBMISSIONS:
    if (triggeredBy === 'APPLICATION') {
      // Get section codes of the changed responses
      const changedSections = await db.getChangedSections(
        changedResponses.map(({ templateElementId }) => templateElementId)
      )

      // Filter out reviews that are not level 1 and don't intersect with
      // changed section codes
      const reviewsToUpdate = reviews.filter(
        ({ reviewStatus, levelNumber, assignedSections }) =>
          levelNumber === 1 &&
          reviewStatus === ReviewStatus.Submitted &&
          assignedSections.some((sectionCode) => changedSections.includes(sectionCode))
      )

      // Set remaining reviews to "PENDING" (using the "changeStatus" action)
      const results: Promise<ActionPluginOutput>[] = []
      reviewsToUpdate.forEach((review) =>
        results.push(
          changeStatus({
            parameters: {
              newStatus: ReviewStatus.Pending,
              reviewId: review.reviewId,
              isReview: true,
            },
            applicationData,
            DBConnect,
          })
        )
      )

      const reviewStatuses = await Promise.all(results)

      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: reviewStatuses.map(({ output }) => output),
        },
      }
    } else {
      // REVIEW SUBMISSIONS:
      if (!reviewId) throw new Error('Missing reviewId')

      const thisReviewLevel = reviews.find((review) => review.reviewId === reviewId)?.levelNumber

      // Remove current review
      const otherReviews = reviews.filter(({ reviewId: id }) => id !== reviewId)

      if (!thisReviewLevel) throw new Error('Invalid reviewId')

      const nextLevelReview = otherReviews.filter(
        ({ levelNumber }) => levelNumber === thisReviewLevel + 1
      )

      // Set review status to "PENDING" for next-level reviews
      const results: Promise<ActionPluginOutput>[] = []
      nextLevelReview.forEach((review) =>
        results.push(
          changeStatus({
            parameters: {
              newStatus: ReviewStatus.Pending,
              reviewId: review.reviewId,
              isReview: true,
            },
            applicationData,
            DBConnect,
          })
        )
      )

      if (thisReviewLevel > 1) {
        // Set lower-level review to "CHANGES REQUESTED" if the current review
        // has disagreed with any response decisions:

        const disagreedSections = await db.getChangedSections(
          (changedResponses as ChangedReviewResponse[])
            .filter(
              ({ reviewResponseDecision }) =>
                reviewResponseDecision === ReviewResponseDecision.Disagree
            )
            .map(({ templateElementId }) => templateElementId)
        )

        const lowerReviewsToUpdate = otherReviews.filter(
          ({ levelNumber, assignedSections }) =>
            levelNumber === thisReviewLevel - 1 &&
            assignedSections.some((section) => disagreedSections.includes(section))
        )

        lowerReviewsToUpdate.forEach((review) =>
          results.push(
            changeStatus({
              parameters: {
                newStatus: ReviewStatus.ChangesRequested,
                reviewId: review.reviewId,
                isReview: true,
              },
              applicationData,
              DBConnect,
            })
          )
        )
      }

      const reviewStatuses = await Promise.all(results)

      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: reviewStatuses.map(({ output }) => output),
        },
      }
    }
  } catch (err) {
    console.log(errorMessage(err))
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem updating review statuses: ' + errorMessage(err),
    }
  }
}

export default updateReviewStatuses
