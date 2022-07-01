import { combineRequestParams } from '../utilityFunctions'
import { processTrigger } from './processTrigger'
import { createDisplayData } from './helpers'
import { Trigger } from '../../generated/graphql'

export const routePreviewActions = async (request: any, reply: any) => {
  const { applicationId, reviewId, previewData } = combineRequestParams(request, 'camel')
  console.log('PREVIEW....')
  console.log('application', applicationId)
  console.log('review', reviewId)
  console.log(previewData)

  // A dummy triggerPayload object, as though it was retrieved from the
  // trigger_queue table
  const triggerPayload = {
    trigger_id: null,
    trigger: Trigger.OnPreview,
    table: reviewId ? 'review' : 'application',
    record_id: reviewId ? Number(reviewId) : Number(applicationId),
    previewData,
  }

  const actionsOutput = await processTrigger(triggerPayload)

  const displayData = createDisplayData(actionsOutput)

  console.log(JSON.stringify(actionsOutput, null, 2))

  // Return results

  return reply.send({ displayData, actionsOutput })
}
