import {
  ActionQueueStatus,
  Decision,
  ReviewResponseDecision,
  ReviewStatus,
} from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import { action as changeStatus } from '../../action_change_status/src'

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

interface ChangedResponse {
  applicationResponseId: number
  templateElementId: number
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
  const stageNumber = parameters?.stageNumber || applicationData?.stageNumber

  // Changed responses normally come from the output of the "trimResponses"
  // action
  const changedResponses: ChangedResponse[] = parameters.changedResponses || []
  const triggeredBy: TriggeredBy = parameters.triggeredBy || 'APPLICATION'

  console.log(
    'Updating statuses of reviews associated with ' + triggeredBy === 'REVIEW'
      ? 'review Id: ' + reviewId
      : 'application Id: ' + applicationId
  )

  // WHY IS THERE TOO MANY CHANGED RESPONSES??

  try {
    if (triggeredBy === 'APPLICATION') {
      const reviews = await db.getAssociatedReviews(applicationId, stageNumber, 1)

      // Get section codes of the changed responses
      const changedSections = await db.getChangedSections(
        changedResponses.map(({ templateElementId }) => templateElementId)
      )

      // Filter out reviews that don't intersect with changed section codes
      const reviewsToUpdate = reviews.filter(
        ({ reviewStatus, assignedSections }) =>
          // Is this correct? (SUBMITTED?)
          reviewStatus === ReviewStatus.Submitted &&
          assignedSections.some((sectionCode) => changedSections.includes(sectionCode))
      )

      // Set remaining reviews to "DRAFT" (using the "changeStatus" action)
      const results: Promise<ActionPluginOutput>[] = []
      reviewsToUpdate.forEach((review) =>
        results.push(
          changeStatus({
            parameters: {
              newStatus: ReviewStatus.Draft,
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
    }
    if (triggeredBy === 'REVIEW') {
      // To-do
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: [],
        },
      }
    }
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        updatedReviews: [],
      },
    }
  } catch (err) {
    console.log(err.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'There was a problem updating review statuses: ' + err.message,
    }
  }
}

export default updateReviewsStatuses
