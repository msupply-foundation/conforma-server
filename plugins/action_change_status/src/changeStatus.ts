import { ActionPluginOutput, Status, ActionPluginInput } from '../../types'

type IParameters = {
  applicationId?: number
  reviewId?: number
  newStatus: Status
  isReview?: boolean
}

async function changeStatus({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  // Get application/reviewId from applicationData if not provided in parameters
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const reviewId = parameters?.reviewId ?? applicationData?.reviewData?.reviewId
  const isReview = parameters?.isReview || applicationData?.trigger_payload?.table === 'review'
  const newStatus = parameters?.newStatus

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
    status: 'Fail',
    error_log: `Neither applicationId or reviewId is provided, cannot run action`,
  }
}

const changeApplicationStatus = async (
  applicationId: number,
  applicationData: { [key: string]: any },
  newStatus: string,
  DBConnect: any
): Promise<ActionPluginOutput> => {
  const returnObject: ActionPluginOutput = { status: null, error_log: '' }
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
      returnObject.status = 'Success'
      returnObject.error_log = 'Status not changed'
      returnObject.output = {
        status: newStatus,
        statusId: current.status_history_id,
        applicationStatusHistoryTimestamp: current.statu_history_time_created,
      }
      return returnObject
    }

    if (!current?.status) {
      returnObject.status = 'Fail'
      returnObject.error_log =
        "No stage defined for this Application. Can't create a status_history record."
      return returnObject
    }

    const currentStageHistoryId = current.stageHistoryId

    // Create a new application_status_history record
    const result = await DBConnect.addNewApplicationStatusHistory(currentStageHistoryId, newStatus)
    if (result.id) {
      returnObject.status = 'Success'
      returnObject.output = {
        status: newStatus,
        statusId: result.id,
        applicationStatusHistoryTimestamp: result.time_created,
      }
      console.log(`New status_history created: ${newStatus}`)
    } else {
      returnObject.status = 'Fail'
      returnObject.error_log = "Couldn't create new application_status_history"
      return returnObject
    }

    // Create output object and return
    returnObject.output = { ...returnObject.output, applicationId }
    return returnObject
  } catch (err) {
    returnObject.status = 'Fail'
    returnObject.error_log = 'Unable to change Status'
    return returnObject
  }
}

const changeReviewStatus = async (
  reviewId: number,
  newStatus: string,
  DBConnect: any
): Promise<ActionPluginOutput> => {
  const returnObject: ActionPluginOutput = { status: null, error_log: '' }
  console.log(`Changing the Status of Review ${reviewId}...`)

  try {
    const currentStatus = await DBConnect.getReviewCurrentStatusHistory(reviewId)

    if (currentStatus?.status === newStatus) {
      // Do nothing
      console.log(
        `WARNING: Review ${reviewId} already has status: ${newStatus}. No changes were made.`
      )
      returnObject.status = 'Success'
      returnObject.error_log = 'Status not changed'
      returnObject.output = {
        status: newStatus,
        statusId: currentStatus.status_history_id,
        reviewStatusHistoryTimestamp: currentStatus.status_history_time_created,
      }
      return returnObject
    }

    // Create a new review_status_history record
    const result = await DBConnect.addNewReviewStatusHistory(reviewId, newStatus)
    if (result.id) {
      returnObject.status = 'Success'
      returnObject.output = {
        status: newStatus,
        statusId: result.id,
        reviewStatusHistoryTimestamp: result.time_created,
      }
      console.log(`New review_status_history created: ${newStatus}`)
    } else {
      returnObject.status = 'Fail'
      returnObject.error_log = "Couldn't create new review_status_history"
      return returnObject
    }

    // Create output object and return
    returnObject.output = { ...returnObject.output, reviewId }
    return returnObject
  } catch (err) {
    returnObject.status = 'Fail'
    returnObject.error_log = 'Unable to change Status'
    return returnObject
  }
}

export default changeStatus
