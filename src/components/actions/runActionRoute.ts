import { actionLibrary } from '../pluginsConnect'
import { getApplicationData } from './getApplicationData'
import { combineRequestParams } from '../utilityFunctions'
import DBConnect from '../databaseConnect'

export const routeRunAction = async (request: any, reply: any) => {
  const { actionCode, applicationId, reviewId, parameters } = combineRequestParams(request, 'camel')
  const applicationData = applicationId ? await getApplicationData({ applicationId, reviewId }) : {}
  const actionResult = await actionLibrary[actionCode]({
    parameters,
    applicationData,
    DBConnect,
  })
  return reply.send(actionResult)
}

export const routeGetApplicationData = async (request: any, reply: any) => {
  const { applicationId, reviewId } = combineRequestParams(request, 'camel')
  const appDataParams: { applicationId: number; reviewId?: number } = {
    applicationId: Number(applicationId),
  }
  if (reviewId) appDataParams.reviewId = Number(reviewId)
  reply.send(await getApplicationData(appDataParams))
}
