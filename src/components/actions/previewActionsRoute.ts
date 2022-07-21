import { combineRequestParams } from '../utilityFunctions'
import { processTrigger } from './processTrigger'
import { ActionQueueStatus, Trigger } from '../../generated/graphql'
import { BasicObject } from '@openmsupply/expression-evaluator/lib/types'

export const routePreviewActions = async (request: any, reply: any) => {
  const { applicationId, reviewId, previewData } = combineRequestParams(request, 'camel')

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

  return reply.send({ displayData, actionsOutput })
}

interface ActionResult {
  action: string // code
  status: ActionQueueStatus
  output: BasicObject | null
  errorLog: string | null
}

interface ActionResultDisplayData {
  type: 'DOCUMENT' | 'NOTIFICATION' | 'OTHER'
  status: ActionQueueStatus
  displayString: string
  text?: string // for email string
  fileId?: string // for generating url in front-end
  errorLog: string | null // if Action failed
}

// Convert the full action output into a simplified format that can be easily
// displayed by the front-end Preview module
export const createDisplayData = (actionsOutput: ActionResult[]): ActionResultDisplayData[] => {
  return actionsOutput.map((result) => {
    switch (result.action) {
      case 'sendNotification':
        return {
          type: 'NOTIFICATION',
          status: result.status,
          displayString: result.output?.notification?.subject ?? 'Email notification',
          text: result.output?.notification?.message,
          errorLog: result.errorLog,
        }
      case 'generateDoc':
        return {
          type: 'DOCUMENT',
          status: result.status,
          displayString:
            result.output?.document?.description ??
            result.output?.document?.filename ??
            'Generated Document',
          fileId: result.output?.document?.uniqueId,
          errorLog: result.errorLog,
        }
      // We're only expecting preview results from sendNotification and generateDoc actions. Fallback for others:
      default:
        return {
          type: 'OTHER',
          status: result.status,
          displayString: `Output of action: ${result.action}`,
          text: JSON.stringify(result.output, null, 2),
          errorLog: result.errorLog,
        }
    }
  })
}
