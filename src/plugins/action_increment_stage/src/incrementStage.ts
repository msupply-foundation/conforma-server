import { ActionPluginOutput } from '../../types'

type IParameters = {
  applicationId: number
}

module.exports['incrementStage'] = async function (
  parameters: IParameters,
  DBConnect: any
): Promise<ActionPluginOutput> {
  const { applicationId } = parameters
  const returnObject: ActionPluginOutput = { status: null, error_log: '' }
  console.log(`Incrementing the Stage for Application ${applicationId}...`)

  try {
    const templateId: number = await DBConnect.getTemplateId('application', applicationId)

    const allStages: Stage[] = await DBConnect.getTemplateStages(templateId)

    const maxStageNumber = Math.max(...allStages.map((stage) => stage.number))

    const currentStageHistory = await DBConnect.getCurrentStageHistory(applicationId)

    const currentStageHistoryId = currentStageHistory?.id
    const currentStageId = currentStageHistory?.stage_id
    const currentStageNum = allStages.find((stage) => stage.id === currentStageId)?.number

    const stageIsMax = currentStageNum === maxStageNumber
    if (stageIsMax) console.log('WARNING: Application is already at final stage. No changes made.')

    const newStageNum = currentStageNum ? (!stageIsMax ? currentStageNum + 1 : currentStageNum) : 1

    const newStageId = allStages.find((stage) => stage.number === newStageNum)?.id

    const newStageHistoryId = stageIsMax
      ? currentStageHistoryId
      : await DBConnect.addNewStageHistory(applicationId, newStageId)

    // Update Status_history -- creates a new record
    const currentStatus = await DBConnect.getCurrentStatusFromStageHistoryId(currentStageHistoryId)

    // Create new COMPLETED status
    if (currentStatus) {
      if (!stageIsMax) {
        const newStatus = await DBConnect.addNewStatusHistory(currentStageHistoryId, 'Completed')
        if (newStatus) {
          returnObject.output = { currentStatus: newStatus.status, statusId: newStatus.id }
        } else {
          returnObject.status = 'Fail'
          returnObject.error_log = "Couldn't create new status"
        }
      }
    } else console.log('No existing status, setting status to Draft')

    // Create new StatusHistory linked to new StageHistory
    const newStatus = await DBConnect.addNewStatusHistory(
      newStageHistoryId,
      currentStatus ? currentStatus.status : 'Draft'
    )
    if (newStatus) {
      returnObject.output = { currentStatus: newStatus.status, statusId: newStatus.id }
    } else {
      returnObject.status = 'Fail'
      returnObject.error_log = "Couldn't create new status"
    }

    if (returnObject.status !== 'Fail') {
      const stageName = allStages.find((stage) => stage.number === newStageNum)?.title
      console.log(`Application Stage: ${stageName}, Status: ${returnObject?.output?.currentStatus}`)
      returnObject.status = 'Success'
      returnObject.output = {
        ...returnObject.output,
        applicationId,
        stageNumber: newStageNum,
        stageName,
        stageHistoryId: newStageHistoryId,
      }
    }
    return returnObject
  } catch (err) {
    console.log('Unable to increment Stage')
    console.log(err.message)
    returnObject.status = 'Fail'
    returnObject.error_log = 'Unable to increment Stage'
    return returnObject
  }
}
