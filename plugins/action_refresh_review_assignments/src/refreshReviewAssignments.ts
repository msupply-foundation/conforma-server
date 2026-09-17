import { ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { SingleApplicationResult, OutputObject } from './types'
import generateReviewAssignments from '../../action_generate_review_assignment_records/src/generateReviewAssignments'
import refreshAssignmentsForUsers from './setBasedRefresh'
import { errorMessage } from '../../../src/components/utilityFunctions'

async function refreshReviewAssignments({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput) {
  const db = databaseMethods(DBConnect)

  // If no userId parameter, we will update ALL active applications
  const shouldRefreshAll = !parameters?.userId

  // Can handle input of either single userId or an array of userIds
  const userIds = Array.isArray(parameters?.userId) ? parameters?.userId : [parameters?.userId]

  // User-scoped refresh: a set-based diff of the users' current permissions
  // against their existing assignment records -- a handful of SQL statements
  // instead of re-generating every reviewer on every application they can
  // access. The full refresh below remains for bulk repair (no userId).
  if (!shouldRefreshAll) {
    try {
      console.log('Refreshing review_assignments for user(s): ' + userIds.join(', '))
      const updatedApplications = await refreshAssignmentsForUsers(DBConnect, userIds)
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: { updatedApplications },
      }
    } catch (error) {
      console.log(errorMessage(error))
      return {
        status: ActionQueueStatus.Fail,
        error_log: 'Problem refreshing review_assignments: ' + errorMessage(error),
      }
    }
  }

  try {
    const applicationIds = await db.getAllActiveApplications()

    console.log('Refreshing review_assignments for ALL active applications...')

    const results: OutputObject = {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { updatedApplications: [] },
    }

    // Iterate over applications and call "generateReviewAssignments" action for
    // each one
    for (const applicationId of applicationIds) {
      const result = await generateReviewAssignments({
        parameters: { applicationId },
        DBConnect,
      })
      results.output.updatedApplications.push({
        applicationId,
        ...result,
      } as SingleApplicationResult)
    }

    return results
  } catch (error) {
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem creating  some review_assignment records: ' + errorMessage(error),
    }
  }
}

export default refreshReviewAssignments
