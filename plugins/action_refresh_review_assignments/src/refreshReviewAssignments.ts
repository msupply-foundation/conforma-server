import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import generateReviewAssignments from '../../action_generate_review_assignment_records/src/generateReviewAssignments'

async function refreshReviewAssignments({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput) {
  const db = databaseMethods(DBConnect)

  // If no userId parameter, we will update ALL active applications
  const shouldRefreshAll = !parameters?.userId

  // Can handle input of either single userId or an array of userIds
  const userIds = Array.isArray(parameters?.userId) ? parameters.userId : [parameters.userId]

  try {
    const getApplicationsToUpdate = async (userIds: number[]) => {
      // Get active applications with existing review assignments for users
      const applicationIds = await db.getApplicationsWithExistingReviewAssignments(userIds)

      // Get active applications based on users' permissions
      applicationIds.push(...(await db.getApplicationsFromUserPermissions(userIds)))

      return Array.from(new Set(applicationIds)) // Makes list elements unique
    }

    const applicationIds = shouldRefreshAll
      ? await db.getAllActiveApplications()
      : await getApplicationsToUpdate(userIds)

    console.log(
      shouldRefreshAll
        ? 'Refreshing review_assignments for ALL active applications...'
        : 'Refreshing review_assignments for applications: ' + applicationIds
    )

    // Iterate over applications and call "generateReviewAssignments" action for
    // each one
    const resultsArray = []
    for (const applicationId of applicationIds) {
      const output = await generateReviewAssignments({
        parameters: { applicationId },
        DBConnect,
      })
      resultsArray.push(output)
    }

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        updatedApplications: applicationIds,
        reviewAssignments: resultsArray,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem creating  some review_assignment records: ' + error.message,
    }
  }
}

export default refreshReviewAssignments
