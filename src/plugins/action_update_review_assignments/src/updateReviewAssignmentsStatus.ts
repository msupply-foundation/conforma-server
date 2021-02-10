import { AssignmentStatus } from './types'

module.exports['updateReviewAssignmentsStatus'] = async function (parameters: any, DBConnect: any) {
  console.log('Updating review assignment statuses...')
  try {
    const { reviewAssignmentId } = parameters
    // NB: reviewAssignmentId comes from record_id on TriggerPayload when
    // triggered from review_assignment table
    const {
      application_id: applicationId,
      stage_number: stageNumber,
      level: reviewLevel,
    } = await DBConnect.getReviewAssignmentById(reviewAssignmentId)

    const otherReviewAssignments = await DBConnect.getMatchingReviewAssignments(
      reviewAssignmentId,
      applicationId,
      stageNumber,
      reviewLevel
    )

    const reviewAssignmentUpdates = await Promise.all(
      otherReviewAssignments.map(async (reviewAssignment: any) => {
        const { id, status, application_id, level } = reviewAssignment
        return {
          id,
          status: await getNewReviewAssignmentStatus(application_id, status, level),
        }
      })
    )

    const reviewAssignmentUpdateResults = await DBConnect.updateReviewAssignments(
      reviewAssignmentUpdates
    )

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

  // Logic for determining what the new review status should be:
  //    For level 2+, "Available" assignments become "Not available"
  //    For level 1, they become "Not available" only if fully assigned
  async function getNewReviewAssignmentStatus(
    application_id: number,
    status: AssignmentStatus,
    level: number
  ) {
    if (status === AssignmentStatus.ASSIGNED) return status
    if (level > 1) return AssignmentStatus.NOT_AVAILABLE
    // Level 1:
    return (await DBConnect.isFullyAssignedLevel1(application_id))
      ? AssignmentStatus.NOT_AVAILABLE
      : AssignmentStatus.AVAILABLE
  }
}
