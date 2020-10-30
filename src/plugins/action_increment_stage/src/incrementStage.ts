import { ActionPluginOutput } from '../../types'

type IParameters = {
  applicationId: number
}

type Stage = {
  id: number
  number: number
  title: string
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

    const newStageNum = currentStageNum
      ? currentStageNum + 1 <= maxStageNumber
        ? currentStageNum + 1
        : currentStageNum
      : 1

    const newStageId = allStages.find((stage) => stage.number === newStageNum)?.id

    const newStageHistoryId = stageIsMax
      ? currentStageHistoryId
      : await DBConnect.addNewStageHistory(applicationId, newStageId)

    // Update Status_history -- either create new Draft, or relink existing
    const currentStatus = await DBConnect.getCurrentStatusFromStageHistoryId(currentStageHistoryId)

    if (currentStatus) {
      // relink existing status
      const result = await DBConnect.relinkStatusHistory(newStageHistoryId)
      if (result) {
        returnObject.output = { currentStatus: currentStatus.status, statusId: currentStatus.id }
      } else {
        returnObject.status = 'Fail'
        returnObject.error_log = "Couldn't relink existing status"
      }
    } else {
      // create new Draft status
      console.log('No existing status')
      const newStatus = await DBConnect.addNewStatusHistory(newStageHistoryId)
      if (newStatus) {
        returnObject.output = { currentStatus: newStatus.status, statusId: newStatus.id }
      } else {
        returnObject.status = 'Fail'
        returnObject.error_log = "Couldn't create new status"
      }
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
