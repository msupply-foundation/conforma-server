import {
  ActionQueueStatus,
  ApplicationOutcome,
  ApplicationStatus,
} from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'

async function incrementStage({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  const applicationId = parameters?.applicationId ?? applicationData?.applicationId
  const outcome = applicationData?.outcome
  const returnObject: ActionPluginOutput = {
    status: ActionQueueStatus.Fail,
    error_log: 'unknown error',
  }
  console.log(`Incrementing the Stage for Application ${applicationId}...`)

  if (outcome != ApplicationOutcome.Pending) {
    console.log("WARNING: Application doesn't have pending outcome")
    returnObject.status = ActionQueueStatus.Success
    returnObject.error_log = 'Warning: No changes made'
    return returnObject
  }

  try {
    const templateId: number =
      applicationData?.templateId ??
      (await DBConnect.getTemplateIdFromTrigger('application', applicationId))

    const current =
      applicationData?.stage && applicationData?.status
        ? applicationData
        : await DBConnect.getCurrentStageStatusHistory(applicationId)

    const currentStageHistoryId = current?.stageHistoryId
    const currentStageNum = current?.stageNumber ?? 0
    const currentStatus = current?.status

    const nextStage = await DBConnect.getNextStage(templateId, currentStageNum)

    if (!nextStage) {
      console.log('WARNING: Application is already at final stage. No changes made.')
      returnObject.status = ActionQueueStatus.Success
      returnObject.error_log = 'Warning: No changes made'
      return returnObject
    }

    if (current?.stageNumber) {
      // Make a "Completed" status_history for existing stage_history
      const result = await DBConnect.addNewApplicationStatusHistory(
        currentStageHistoryId,
        ApplicationStatus.Completed
      )
      if (!result) {
        returnObject.status = ActionQueueStatus.Fail
        returnObject.error_log = "Couldn't create new status"
        return returnObject
      }
    }

    // Create new stage_history
    const newStageHistoryId = await DBConnect.addNewStageHistory(applicationId, nextStage.stage_id)

    // Create new status_history
    const newStatusHistory = await DBConnect.addNewApplicationStatusHistory(
      newStageHistoryId,
      currentStatus ? currentStatus : ApplicationStatus.Draft
    )

    if (!newStageHistoryId || !newStatusHistory) {
      returnObject.status = ActionQueueStatus.Fail
      returnObject.error_log = 'Problem creating new stage_history or status_history'
      return returnObject
    }

    returnObject.status = ActionQueueStatus.Success
    returnObject.output = {
      applicationId,
      stageNumber: nextStage.stage_number,
      stageName: nextStage.title,
      stageHistoryId: newStageHistoryId,
      statusId: newStatusHistory.id,
      status: newStatusHistory.status,
    }
    console.log(
      `Application ${applicationId} Stage incremented to ${returnObject.output.stageName}. Status: ${returnObject.output.status}`
    )
    return returnObject
  } catch (err) {
    console.log(err.message)
    returnObject.status = ActionQueueStatus.Fail
    returnObject.error_log = 'Unable to increment Stage'
    return returnObject
  }
}

export default incrementStage
