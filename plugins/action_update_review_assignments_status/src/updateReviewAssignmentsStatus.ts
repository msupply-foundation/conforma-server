import { ActionQueueStatus, ReviewAssignment, Trigger } from '../../../src/generated/graphql'
import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'

async function updateReviewAssignmentsStatus({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput) {
  const db = databaseMethods(DBConnect)
  console.log('Updating review assignment statuses...')

  try {
    const trigger = parameters?.trigger ?? applicationData?.action_payload?.trigger_payload?.trigger
    const { reviewAssignmentId } = parameters

    let assignments: ReviewAssignment[] = []
    // NB: reviewAssignmentId comes from record_id on TriggerPayload when
    // triggered from review_assignment table
    const {
      application_id: applicationId,
      stage_number: stageNumber,
      level_number: reviewLevel,
    } = await db.getReviewAssignmentById(reviewAssignmentId)

    switch (trigger) {
      case Trigger.OnReviewSelfAssign: {
        const isSelfAssignable = true
        const otherSelfAssignments = await db.getMatchingReviewAssignments(
          reviewAssignmentId,
          applicationId,
          stageNumber,
          reviewLevel,
          isSelfAssignable
        )

        assignments = otherSelfAssignments.map(({ id }: ReviewAssignment) => ({
          id,
          isLocked: true,
        }))
      }
    }

    const reviewAssignmentUpdateResults = await db.updateReviewAssignments(assignments)

    if (reviewAssignmentUpdateResults.length > 0) {
      console.log('Review Assignment status updates:', reviewAssignmentUpdateResults)
    }

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignmentUpdates: reviewAssignmentUpdateResults,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem updating review_assignment statuses.',
    }
  }
}

export default updateReviewAssignmentsStatus
