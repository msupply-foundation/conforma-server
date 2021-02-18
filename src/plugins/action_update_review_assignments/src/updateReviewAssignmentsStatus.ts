import { AssignmentStatus } from './types'
import databaseMethods from './databaseMethods'

module.exports['updateReviewAssignmentsStatus'] = async function (parameters: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)
  console.log('Updating review assignment statuses...')
  try {
    const { reviewAssignmentId, trigger } = parameters
    // NB: reviewAssignmentId comes from record_id on TriggerPayload when
    // triggered from review_assignment table
    const {
      application_id: applicationId,
      stage_number: stageNumber,
      level: reviewLevel,
    } = await db.getReviewAssignmentById(reviewAssignmentId)

    const otherReviewAssignments = await db.getMatchingReviewAssignments(
      reviewAssignmentId,
      applicationId,
      stageNumber,
      reviewLevel
    )

    const reviewAssignmentUpdates = await Promise.all(
      otherReviewAssignments.map(async (reviewAssignment: any) => {
        const { id, status } = reviewAssignment
        return {
          id,
          status: trigger === 'onReviewSelfAssign' ? AssignmentStatus.SELF_ASSIGNED_OTHER : status,
        }
      })
    )

    const reviewAssignmentUpdateResults = await db.updateReviewAssignments(reviewAssignmentUpdates)

    console.log('Review Assignment status updates:', reviewAssignmentUpdateResults)

    return {
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignmentUpdates: reviewAssignmentUpdateResults,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Problem updating review_assignment statuses.',
    }
  }
}
