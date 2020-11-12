import path from 'path'
import { getAppRootDir } from './utilityFunctions'
import * as config from '../config.json'
import {
  ActionLibrary,
  ActionInTemplate,
  TriggerPayload,
  ActionPayload,
  ActionSequential,
  ActionQueueExecutePayload,
  ActionApplicationData,
} from '../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import DBConnect from './databaseConnect'
import { actionLibrary } from './pluginsConnect'
import { BasicObject, IParameters } from '@openmsupply/expression-evaluator/lib/types'

export const fetchDataFromTrigger = async (payload: TriggerPayload) => {
  const applicationId = await DBConnect.getApplicationIdFromTrigger(
    payload.table,
    payload.record_id
  )

  const applicationData = await DBConnect.getApplicationData(applicationId)

  if (!applicationData?.templateId)
    applicationData.templateId = await DBConnect.getTemplateIdFromTrigger(
      payload.table,
      payload.record_id
    )

  // const userData = applicationData?.userId ? await getUserData(userId) : null

  // const responseData = await getApplicationResponses(applicationId)

  return { ...payload, ...applicationData }
  // ...userData, ...responseData }
}
