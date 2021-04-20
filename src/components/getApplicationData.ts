import { ActionPayload } from '../types'
import DBConnect from './databaseConnect'
import { BasicObject } from '@openmsupply/expression-evaluator/lib/types'
import { getAppEntryPointDir } from './utilityFunctions'
import config from '../config.json'

// Add more data (such as org/review, etc.) here as required
export const getApplicationData = async (payload: ActionPayload) => {
  const { trigger_payload } = payload
  if (!trigger_payload) throw new Error('trigger_payload required')
  const applicationId = await DBConnect.getApplicationIdFromTrigger(
    trigger_payload.table,
    trigger_payload.record_id
  )
  const applicationResult = await DBConnect.getApplicationData(applicationId)

  const applicationData = applicationResult ? applicationResult : { applicationId }

  if (!applicationData?.templateId)
    applicationData.templateId = await DBConnect.getTemplateIdFromTrigger(
      trigger_payload.table,
      trigger_payload.record_id
    )

  const userData = applicationData?.userId
    ? await DBConnect.getUserData(applicationData?.userId)
    : null

  const responses = await DBConnect.getApplicationResponses(applicationId)

  const responseData: BasicObject = {}
  for (const response of responses) {
    responseData[response.code] = response.value
  }

  const reviewData =
    trigger_payload.table === 'review'
      ? {
          reviewId: trigger_payload.record_id,
          ...(await DBConnect.getReviewData(trigger_payload.record_id)),
        }
      : {}

  const environmentData = {
    appRootFolder: getAppEntryPointDir(),
    filesFolder: config.filesFolder,
  }

  return {
    action_payload: payload,
    ...applicationData,
    ...userData,
    responses: responseData,
    reviewData,
    environmentData,
  }
}
