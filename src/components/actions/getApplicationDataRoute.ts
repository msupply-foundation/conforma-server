import { getApplicationData } from './getApplicationData'
import { combineRequestParams } from '../utilityFunctions'

export const routeGetApplicationData = async (request: any, reply: any) => {
  const { applicationId, reviewId } = combineRequestParams(request, 'camel')
  const appDataParams: { applicationId: number; reviewId?: number } = {
    applicationId: Number(applicationId),
  }
  if (reviewId) appDataParams.reviewId = Number(reviewId)
  reply.send(await getApplicationData(appDataParams))
}
