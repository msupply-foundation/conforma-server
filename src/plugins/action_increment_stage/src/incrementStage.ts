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
  try {
    const templateId: number = await DBConnect.getTemplateId('application', applicationId)

    const allStages: Stage[] = await DBConnect.getTemplateStages(templateId)

    const maxStageNum = Math.max(...allStages.map((stage) => stage.number))

    const currentStageId = await DBConnect.getCurrentStageId(applicationId)

    const currentStageNum = allStages.find((stage) => stage.id === currentStageId)?.number

    if (currentStageNum === maxStageNum)
      console.log('WARNING: Application is already at final stage. No changes made.')

    const newStageNum = currentStageNum
      ? currentStageNum + 1 <= maxStageNum
        ? currentStageNum + 1
        : currentStageNum
      : 1

    const newStageId = allStages.find((stage) => stage.number === newStageNum)?.id

    const newStageHistoryId = await DBConnect.addNewStageHistory(applicationId, newStageId)

    // Update Status_history -- either create new Draft, or relink existing
    const currentStatus = await DBConnect.getCurrentStatusFromStageHistoryId(currentStageId)

    if (currentStatus) {
      // relink existing status
      const result = await DBConnect.relinkStatusHistory(newStageHistoryId)
      if (result) {
        returnObject.output = { currentStatus: currentStatus.status }
      } else {
        returnObject.status = 'Fail'
        returnObject.error_log = "Couldn't relink existing status"
      }
    } else {
      // create new Draft status
      console.log('No status found')
      const newStatus = await DBConnect.addNewStatusHistory(newStageHistoryId)
      if (newStatus) {
        returnObject.output = { currentStatus: newStatus }
      } else {
        returnObject.status = 'Fail'
        returnObject.error_log = "Couldn't create new status"
      }
    }

    if (returnObject.status !== 'Fail') {
      returnObject.status = 'Success'
      returnObject.output = {
        ...returnObject.output,
        applicationId,
        stageNumber: newStageNum,
        stageName: allStages.find((stage) => stage.number === newStageNum)?.title,
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
  // Get list of Stages id, num, name for Template
  // Get Current Stage of Application
  // If none -- create one, create new Status = Draft
  // If there is one
  // -- set isCurrent to false (maybe Postgres function to auto-turn off other is_Currents)
  // -- new Stage history record +1
  // -- Relink Status history record
  // Output "applicationId", "stageNumber, stageName, currentStatus"
  //

  // try {
  //   console.log(`\nUpdating application: ${newOutcome}`)
  //   const success = await DBConnect.setApplicationOutcome(application_id, newOutcome)
  //   if (success)
  //     return {
  //       status: 'Success',
  //       error_log: '',
  //       output: {
  //         applicationId: application_id,
  //         newOutcome,
  //       },
  //     }
  //   else
  //     return {
  //       status: 'Fail',
  //       error_log: 'There was a problem updating the application.',
  //     }
  // } catch (error) {
  //   return {
  //     status: 'Fail',
  //     error_log: 'There was a problem updating the application.',
  //   }
  // }
}
