import { ActionPluginOutput } from '../../types'

type Status =
  | 'Draft'
  | 'Withdrawn'
  | 'Submitted'
  | 'Changes Required'
  | 'Re-submitted'
  | 'Completed'

type IParameters = {
  applicationId: number
  newStatus: Status
}

module.exports['changeStatus'] = async function (
  parameters: IParameters,
  DBConnect: any
): Promise<ActionPluginOutput> {
  const { applicationId, newStatus } = parameters
  const returnObject: ActionPluginOutput = { status: null, error_log: '' }
  console.log(`Changing the Status of Application ${applicationId}...`)

  try {
    const currentStatus = await DBConnect.getCurrentStatusHistory(applicationId)

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
        console.log("No stage defined for this Application. Can't create a status_history record.")
        returnObject.status = 'Fail'
        returnObject.error_log = 'Missing stage_history for Application'
        return returnObject
      } else currentStageHistoryId = result.id
    } else currentStageHistoryId = currentStatus.application_stage_history_id

    // Create a new application_status_history record
    const result = await DBConnect.addNewStatusHistory(currentStageHistoryId, newStatus)
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
    console.log('Unable to change Status')
    console.log(err.message)
    returnObject.status = 'Fail'
    returnObject.error_log = 'Unable to change Status'
    return returnObject
  }
}
