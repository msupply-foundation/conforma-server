import { TriggerPayload } from '../types'
import DBConnect from './databaseConnect'
import { BasicObject } from '@openmsupply/expression-evaluator/lib/types'

// Add more data (such as org/review, etc.) here as required
export const fetchDataFromTrigger = async (payload: TriggerPayload) => {
  const applicationId = await DBConnect.getApplicationIdFromTrigger(
    payload.table,
    payload.record_id
  )

  const applicationResult = await DBConnect.getApplicationData(applicationId)

  const applicationData = applicationResult ? applicationResult : { applicationId }

  if (!applicationData?.templateId)
    applicationData.templateId = await DBConnect.getTemplateIdFromTrigger(
      payload.table,
      payload.record_id
    )

  const userData = applicationData?.userId
    ? await DBConnect.getUserData(applicationData?.userId)
    : null

  const responses = await DBConnect.getApplicationResponses(applicationId)

  const responseData: BasicObject = {}
  for (const response of responses) {
    responseData[response.code] = response.value
  }

  return { ...payload, ...applicationData, ...userData, responses: responseData }
}
