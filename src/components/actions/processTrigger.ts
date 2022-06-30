import { ActionInTemplate, TriggerPayload, ActionSequential } from '../../types'
import DBConnect from '../databaseConnect'
import { actionLibrary } from '../pluginsConnect'
import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import { executeAction } from './executeAction'
import { ActionQueueStatus, TriggerQueueStatus } from '../../generated/graphql'
import { swapOutAliasedActions } from './helpers'

// Dev config
const showActionOutcomeLog = false

export async function processTrigger(payload: TriggerPayload) {
  const { trigger_id, trigger, table, record_id, data, event_code, previewData } = payload

  console.log('Input payload', payload)

  const templateId = await DBConnect.getTemplateIdFromTrigger(payload.table, payload.record_id)

  // Get Actions from matching Template (and match templateActionCode if applicable)
  const actions = (await DBConnect.getActionsByTemplateId(templateId, trigger))
    .filter((action) => {
      if (!event_code) return true
      else return action.event_code === event_code
    })
    .map((action) => (action.code !== 'alias' ? action : swapOutAliasedActions(templateId, action)))

  const resolvedActions = await Promise.all(actions)

  // Separate into Sequential and Async actions
  const actionsSequential: ActionSequential[] = []
  const actionsAsync: ActionInTemplate[] = []
  for (const action of resolvedActions) {
    if (action.sequence) actionsSequential.push(action as ActionSequential)
    else actionsAsync.push(action)
  }

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
      preview_data: previewData,
    })
  }
  if (trigger_id)
    await DBConnect.updateTriggerQueueStatus({
      status: TriggerQueueStatus.ActionsDispatched,
      id: trigger_id,
    })

  // Get sequential Actions from database
  const actionsToExecute = await DBConnect.getActionsProcessing(templateId)

  // Collect output properties of actions in sequence
  // "data" is stored output from scheduled triggers or verifications
  let outputCumulative = { ...data?.outputCumulative }

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
        previewData
      )
      outputCumulative = { ...outputCumulative, ...result.output }
      // Debug helper console.log to inspect action outputs:
      if (showActionOutcomeLog) console.log('outputCumulative:', outputCumulative)
      if (result.status === ActionQueueStatus.Fail) console.log(result.error_log)
    } catch (err) {
      actionFailed = action.action_code
    }
  }

  // console.log('outputCumulative', outputCumulative)
  // After all done, set Trigger on table back to NULL (or Error)
  DBConnect.resetTrigger(table, record_id, actionFailed !== '')
  // and set is_active = false if scheduled action
  if (table === 'trigger_schedule' && actionFailed === '')
    DBConnect.setScheduledActionDone(table, record_id)
}
