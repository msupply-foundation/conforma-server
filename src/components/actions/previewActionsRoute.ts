import { combineRequestParams } from '../utilityFunctions'
import { processTrigger } from './processTrigger'
import { createDisplayData } from './helpers'
import { Trigger } from '../../generated/graphql'

export const routePreviewActions = async (request: any, reply: any) => {
  const { applicationId, reviewId, previewData } = combineRequestParams(request, 'camel')

  // A dummy triggerPayload object, as though it was retrieved from the
  // trigger_queue table
  const triggerPayload = {
    trigger_id: null,
    trigger: Trigger.OnPreview,
    table: reviewId ? 'review' : 'application',
    record_id: reviewId ? Number(reviewId) : Number(applicationId),
    applicationDataExtra: previewData,
  }

  const actionsOutput = await processTrigger(triggerPayload)

  const displayData = createDisplayData(actionsOutput)

  return reply.send({ displayData, actionsOutput })
}
