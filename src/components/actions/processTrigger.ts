import { TriggerPayload, ActionResult } from '../../types'
import DBConnect from '../databaseConnect'
import { actionLibrary } from '../pluginsConnect'
import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import { executeAction } from './executeAction'
import { ActionQueueStatus, TriggerQueueStatus } from '../../generated/graphql'
import { swapOutAliasedAction } from './helpers'

// Dev config
const showActionOutcomeLog = false

export async function processTrigger(payload: TriggerPayload): Promise<ActionResult[]> {
  const { trigger_id, trigger, table, record_id, data, event_code, applicationDataOverride } =
    payload

  const templateId = await DBConnect.getTemplateIdFromTrigger(payload.table, payload.record_id)

  // Get Actions from matching Template (and match templateActionCode if applicable)
  const actions = (await DBConnect.getActionsByTemplateId(templateId, trigger))
    .filter((action) => {
      if (!event_code) return true
      else return action.event_code === event_code
    })
    .map((action) => (action.code !== 'alias' ? action : swapOutAliasedAction(templateId, action)))

  // .filter/.map runs each loop async, so need to wait for them all to finish
  const resolvedActions = await Promise.all(actions)

  // Separate into Sequential and Async actions
  const actionsSequential = resolvedActions.filter(({ sequence }) => !!sequence)
  const actionsAsync = resolvedActions.filter(({ sequence }) => !sequence)

  for (const action of [...actionsAsync, ...actionsSequential]) {
    // Add all actions to Action Queue
    await DBConnect.addActionQueue({
      trigger_event: trigger_id,
      trigger_payload: payload,
      template_id: templateId,
      sequence: action.sequence,
      action_code: action.code,
      parameter_queries: action.parameter_queries,
      parameters_evaluated: {},
      condition_expression: action.condition,
      status:
        typeof action.sequence === 'number'
          ? ActionQueueStatus.Processing
          : ActionQueueStatus.Queued,
    })
  }
  if (trigger_id)
    await DBConnect.updateTriggerQueueStatus({
      status: TriggerQueueStatus.ActionsDispatched,
      id: trigger_id,
    })

  // Get sequential Actions from database (Async actions are handled directly by
  // pg_notify -- see listeners in postgresConnect.ts)
  const actionsToExecute = await DBConnect.getActionsProcessing(templateId)

  // Collect output properties of actions in sequence
  // "data" is stored output from scheduled triggers or verifications
  let outputCumulative = { ...data?.outputCumulative }

  // Result collection to send back to preview endpoint
  // (but could be used elsewhere if required)
  const actionOutputs = []

  // Execute sequential Actions one by one
  let actionFailed = ''
  for (const action of actionsToExecute) {
    if (actionFailed) {
      await DBConnect.executedActionStatusUpdate({
        status: ActionQueueStatus.Fail,
        error_log: 'Action cancelled due to failure of previous sequential action ' + actionFailed,
        parameters_evaluated: null,
        output: null,
        id: action.id,
      })
      continue
    }
    try {
      const actionPayload = {
        id: action.id,
        code: action.action_code,
        condition_expression: action.condition_expression as EvaluatorNode,
        parameter_queries: action.parameter_queries,
        trigger_payload: action.trigger_payload,
      }
      const result = await executeAction(
        actionPayload,
        actionLibrary,
        {
          outputCumulative,
        },
        applicationDataOverride
      )

      outputCumulative = { ...outputCumulative, ...result.output }
      if (result.status !== ActionQueueStatus.ConditionNotMet)
        actionOutputs.push({
          action: action.action_code,
          status: result.status,
          output: result.output,
          errorLog: result.error_log ? result.error_log : null,
        })

      // Debug helper console.log to inspect action outputs:
      if (showActionOutcomeLog) console.log('outputCumulative:', outputCumulative)
      if (result.status === ActionQueueStatus.Fail) console.log(result.error_log)
    } catch (err) {
      actionFailed = action.action_code
    }
  }

  // After all done, set Trigger on table back to NULL (or Error)
  await DBConnect.resetTrigger(table, record_id, actionFailed !== '')
  // and set is_active = false if scheduled action
  if (table === 'trigger_schedule' && actionFailed === '')
    await DBConnect.setScheduledActionDone(table, record_id)
  // and set trigger_queue status to "COMPLETED"
  if (trigger_id)
    await DBConnect.updateTriggerQueueStatus({
      status: actionFailed ? TriggerQueueStatus.Error : TriggerQueueStatus.Completed,
      id: trigger_id,
    })

  // Return value only used by Previews endpoint
  return actionOutputs
}
