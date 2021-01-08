import { ActionPluginOutput, Status } from '../../types'

type IParameters = {
  applicationId: number
  reviewId: number
  newStatus: Status
}

module.exports['changeStatus'] = async function (
  parameters: IParameters,
  DBConnect: any
): Promise<ActionPluginOutput> {
  const { applicationId, reviewId, newStatus } = parameters

  if (applicationId) {
    return await changeApplicationStatus(applicationId, newStatus, DBConnect)
  } else if (reviewId) {
    return await changeReviewStatus(reviewId, newStatus, DBConnect)
  }

  return {
    status: 'Fail',
    error_log: `Neither applicationId or reviewId is provided, cannot run action`,
  }
}

const changeApplicationStatus = async (
  applicationId: number,
  newStatus: string,
  DBConnect: any
): Promise<ActionPluginOutput> => {
  const returnObject: ActionPluginOutput = { status: null, error_log: '' }
  console.log(`Changing the Status of Application ${applicationId}...`)

  try {
    const currentStatus = await DBConnect.getApplicationCurrentStatusHistory(applicationId)

    if (currentStatus?.status === newStatus) {
      // Do nothing
      console.log(
        `WARNING: Application ${applicationId} already has status: ${newStatus}. No changes were made.`
      )
      returnObject.status = 'Success'
      returnObject.error_log = 'Status not changed'
      returnObject.output = { status: newStatus, statusId: currentStatus.id }
      return returnObject
    }

    // Get current stage_history_id if not already known from status_history
    let currentStageHistoryId
    if (!currentStatus?.status) {
      const result = await DBConnect.getCurrentStageHistory(applicationId)
      if (!result) {
        returnObject.status = 'Fail'
        returnObject.error_log =
          "No stage defined for this Application. Can't create a status_history record."
        return returnObject
      } else currentStageHistoryId = result.id
    } else currentStageHistoryId = currentStatus.application_stage_history_id

    // Create a new application_status_history record
    const result = await DBConnect.addNewApplicationStatusHistory(currentStageHistoryId, newStatus)
    if (result.id) {
      returnObject.status = 'Success'
      returnObject.output = { status: newStatus, statusId: result.id }
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
      returnObject.output = { status: newStatus, statusId: currentStatus.id }
      return returnObject
    }

    // Create a new review_status_history record
    const result = await DBConnect.addNewReviewStatusHistory(reviewId, newStatus)
    if (result.id) {
      returnObject.status = 'Success'
      returnObject.output = { status: newStatus, statusId: result.id }
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
