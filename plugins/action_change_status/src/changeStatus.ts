import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'

async function changeStatus({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  const isReview =
    parameters?.isReview === false
      ? false
      : parameters?.isReview || applicationData?.action_payload?.trigger_payload?.table === 'review'
  const newStatus = parameters?.newStatus

  console.log(`Changing status of ${isReview ? 'Review' : 'Application'} to ${newStatus}`)

  if (!newStatus)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Missing property: "newStatus"',
    }

  if (!isReview) {
    return await changeApplicationStatus(
      applicationId,
      applicationData as { [key: string]: any },
      newStatus,
      DBConnect
    )
  } else if (reviewId && isReview) {
    return await changeReviewStatus(reviewId, newStatus, DBConnect)
  }

  return {
    status: ActionQueueStatus.Fail,
    error_log: `Neither applicationId or reviewId is provided, cannot run action`,
  }
}

const changeApplicationStatus = async (
  applicationId: number,
  applicationData: { [key: string]: any },
  newStatus: string,
  DBConnect: any
): Promise<ActionPluginOutput> => {
  const returnObject: ActionPluginOutput = {
    status: ActionQueueStatus.Fail,
    error_log: '',
  }
  console.log(`Changing the Status of Application ${applicationId}...`)

  try {
    const current =
      applicationData?.stage && applicationData?.status
        ? applicationData
        : await DBConnect.getCurrentStageStatusHistory(applicationId)

    if (current?.status === newStatus) {
      // Do nothing
      console.log(
        `WARNING: Application ${applicationId} already has status: ${newStatus}. No changes were made.`
      )
      returnObject.status = ActionQueueStatus.Success
      returnObject.error_log = 'Application Status not changed'
      returnObject.output = {
        status: newStatus,
        statusId: current.statusHistoryId,
        applicationStatusHistoryTimestamp: current.statusHistoryTimeCreated,
        applicationId,
      }
      return returnObject
    }

    if (!current?.status) {
      returnObject.status = ActionQueueStatus.Fail
      returnObject.error_log =
        "No stage defined for this Application. Can't create a status_history record."
      return returnObject
    }

    const currentStageHistoryId = current.stageHistoryId

    // Create a new application_status_history record
    const result = await DBConnect.addNewApplicationStatusHistory(currentStageHistoryId, newStatus)
    if (result.id) {
      returnObject.status = ActionQueueStatus.Success
      returnObject.output = {
        status: newStatus,
        statusId: result.id,
        applicationStatusHistoryTimestamp: result.time_created,
        applicationId,
      }
      console.log(`New status_history created: ${newStatus}`)
    } else {
      returnObject.status = ActionQueueStatus.Fail
      returnObject.error_log = "Couldn't create new application_status_history"
      return returnObject
    }

    // Create output object and return
    returnObject.output = { ...returnObject.output }
    return returnObject
  } catch (err) {
    returnObject.status = ActionQueueStatus.Fail
    returnObject.error_log = 'Unable to change Status'
    return returnObject
  }
}

const changeReviewStatus = async (
  reviewId: number,
  newStatus: string,
  DBConnect: any
): Promise<ActionPluginOutput> => {
  const returnObject: ActionPluginOutput = {
    status: ActionQueueStatus.Fail,
    error_log: '',
  }
  console.log(`Changing the Status of Review ${reviewId}...`)

  try {
    const currentStatus = await DBConnect.getReviewCurrentStatusHistory(reviewId)

    if (currentStatus?.status === newStatus) {
      // Do nothing
      console.log(
        `WARNING: Review ${reviewId} already has status: ${newStatus}. No changes were made.`
      )
      returnObject.status = ActionQueueStatus.Success
      returnObject.error_log = 'Review Status not changed'
      returnObject.output = {
        status: newStatus,
        statusId: currentStatus.id,
        reviewStatusHistoryTimestamp: currentStatus.time_created,
        reviewId,
      }
      return returnObject
    }

    // Create a new review_status_history record
    const result = await DBConnect.addNewReviewStatusHistory(reviewId, newStatus)
    if (result.id) {
      returnObject.status = ActionQueueStatus.Success
      returnObject.output = {
        status: newStatus,
        statusId: result.id,
        reviewStatusHistoryTimestamp: result.time_created,
        reviewId,
      }
      console.log(`New review_status_history created: ${newStatus}`)
    } else {
      returnObject.status = ActionQueueStatus.Fail
      returnObject.error_log = "Couldn't create new review_status_history"
      return returnObject
    }

    // Create output object and return
    returnObject.output = { ...returnObject.output }
    return returnObject
  } catch (err) {
    returnObject.status = ActionQueueStatus.Fail
    returnObject.error_log = 'Unable to change Status'
    return returnObject
  }
}

export default changeStatus
