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

  console.log('Application ID', applicationId)
  try {
    const currentStatus = await DBConnect.getCurrentStatus(applicationId)

    switch (currentStatus?.status) {
      case undefined:
        // Create initial status
        const currentStageHistoryId = await DBConnect.getCurrentStageHistory(applicationId)
        if (!currentStageHistoryId) {
          console.log(
            "No stage configured for this Application. Can't create a status_history record."
          )
          returnObject.status = 'Fail'
          returnObject.error_log = 'Missing stage_history for Application'
        } else {
          const result = await DBConnect.addStatusHistory(
            currentStatus.application_stage_history_id,
            newStatus
          )
          if (result.id) {
            returnObject.status = 'Success'
            returnObject.output = { status: newStatus, statusId: result.id }
          } else {
            returnObject.status = 'Fail'
            returnObject.error_log = "Couldn't create new application_status_history"
          }
        }
        break
      case newStatus:
        // Do nothing
        console.log(
          `WARNING: Application ${applicationId} already has status: ${newStatus}. No changes were made.`
        )
        returnObject.status = 'Success'
        returnObject.error_log = 'Status not changed'
        returnObject.output = { status: newStatus, statusId: currentStatus.id }
        break
      default:
        // Create a new application_status_history record
        const result = await DBConnect.addStatusHistory(
          currentStatus.application_stage_history_id,
          newStatus
        )
        if (result.id) {
          returnObject.status = 'Success'
          returnObject.output = { status: newStatus, statusId: result.id }
        } else {
          returnObject.status = 'Fail'
          returnObject.error_log = "Couldn't create new application_status_history"
        }
    }

    // Create output object and return
    if (returnObject.status !== 'Fail')
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
