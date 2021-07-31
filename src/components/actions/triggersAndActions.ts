import {
  ActionLibrary,
  ActionInTemplate,
  TriggerPayload,
  ActionPayload,
  ActionSequential,
  ActionQueueExecutePayload,
} from '../../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import functions from './evaluatorFunctions'
import DBConnect from '../databaseConnect'
import fetch from 'node-fetch'
import { actionLibrary } from '../pluginsConnect'
import {
  BasicObject,
  EvaluatorNode,
  IParameters,
} from '@openmsupply/expression-evaluator/lib/types'
import { getApplicationData } from './getApplicationData'
import { getAppEntryPointDir } from '../utilityFunctions'
import path from 'path'
import { ActionQueueStatus, TriggerQueueStatus } from '../../generated/graphql'
import scheduler from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'

// Dev configs
const showApplicationDataLog = false
const showActionOutcomeLog = false
const schedulerMode = 'test'

const graphQLEndpoint = config.graphQLendpoint

// Load actions from Database at server startup
export const loadActions = async function (actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  try {
    const result = await DBConnect.getActionPlugins()

    result.forEach((row) => {
      // This should import action from index.js (entry point of plugin)
      actionLibrary[row.code] = require(path.join(getAppEntryPointDir(), row.path)).action
      console.log('Action loaded: ' + row.code)
    })

    console.log('Actions loaded.')
  } catch (err) {
    console.log(err.stack)
  }
}

// Instantiate node-scheduler to run scheduled actions periodically
const checkActionSchedule = new scheduler.RecurrenceRule()

const hoursSchedule = config.hoursSchedule
checkActionSchedule.hour = hoursSchedule
if (schedulerMode === 'test') checkActionSchedule.second = [0, 30]
else checkActionSchedule.minute = 0

scheduler.scheduleJob(checkActionSchedule, () => {
  triggerScheduledActions()
})

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}

export async function processTrigger(payload: TriggerPayload) {
  const { trigger_id, trigger, table, record_id, data, event_code } = payload

  const templateId = await DBConnect.getTemplateIdFromTrigger(payload.table, payload.record_id)

  // Get Actions from matching Template (and match templateActionCode if applicable)
  const actions = await (
    await DBConnect.getActionsByTemplateId(templateId, trigger)
  ).filter((action) => {
    if (!event_code) return true
    else return action.event_code === event_code
  })

  // Separate into Sequential and Async actions
  const actionsSequential: ActionSequential[] = []
  const actionsAsync: ActionInTemplate[] = []
  for (const action of actions) {
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
    })
  }
  await DBConnect.updateTriggerQueueStatus({
    status: TriggerQueueStatus.ActionsDispatched,
    id: trigger_id,
  })

  // Get sequential Actions from database
  const actionsToExecute = await DBConnect.getActionsProcessing(templateId)

  // Collect output properties of actions in sequence
  // "data" is stored output from scheduled triggers or verifications
  let outputCumulative = { ...data }

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
      console.log('outputCumulative', outputCumulative)
      const result = await executeAction(actionPayload, actionLibrary, {
        outputCumulative,
      })
      outputCumulative = { ...outputCumulative, ...result.output }
      // Debug helper console.log to inspect action outputs:
      if (showActionOutcomeLog) console.log('outputCumulative:', outputCumulative)
      if (result.status === ActionQueueStatus.Fail) console.log(result.error_log)
    } catch (err) {
      actionFailed = action.action_code
    }
  }
  // After all done, set Trigger on table back to NULL (or Error)
  DBConnect.resetTrigger(table, record_id, actionFailed !== '')
  // and set is_active = false if scheduled action
  if (table === 'trigger_schedule' && actionFailed === '')
    DBConnect.setScheduledActionDone(table, record_id)
}

async function evaluateParameters(
  parameterQueries: BasicObject,
  evaluatorParameters: IParameters = {}
) {
  const parametersEvaluated: BasicObject = {}
  try {
    for (const key in parameterQueries) {
      parametersEvaluated[key] = await evaluateExpression(
        parameterQueries[key],
        evaluatorParameters
      )
    }
    return parametersEvaluated
  } catch (err) {
    throw err
  }
}

export async function executeAction(
  payload: ActionPayload,
  actionLibrary: ActionLibrary,
  additionalObjects: any = {}
): Promise<ActionQueueExecutePayload> {
  // Get fresh applicationData for each Action
  const applicationData = await getApplicationData({ payload })

  // Debug helper console.log to inspect applicationData:
  if (showApplicationDataLog) console.log('ApplicationData: ', applicationData)

  console.log('additionalObjects', additionalObjects)

  const evaluatorParams = {
    objects: { applicationData, functions, ...additionalObjects },
    pgConnection: DBConnect,
    APIfetch: fetch,
    graphQLConnection: { fetch, endpoint: graphQLEndpoint },
  }

  // Evaluate condition
  const condition = await evaluateExpression(
    payload.condition_expression as EvaluatorNode,
    evaluatorParams
  )
  if (condition) {
    try {
      // Evaluate parameters
      const parametersEvaluated = await evaluateParameters(
        payload.parameter_queries,
        evaluatorParams
      )

      console.log('parametersEvaluated', parametersEvaluated)

      // TO-DO: Check all required parameters are present

      // TO-DO: If Scheduled, create a Job instead
      const actionResult = await actionLibrary[payload.code]({
        parameters: parametersEvaluated,
        applicationData,
        outputCumulative: evaluatorParams.objects?.outputCumulative || {},
        DBConnect,
      })

      return await DBConnect.executedActionStatusUpdate({
        status: actionResult.status,
        error_log: actionResult.error_log,
        parameters_evaluated: parametersEvaluated,
        output: actionResult.output,
        id: payload.id,
      })
    } catch (err) {
      console.error('>> Error executing action:', payload.code)
      await DBConnect.executedActionStatusUpdate({
        status: ActionQueueStatus.Fail,
        error_log: "Couldn't execute Action: " + err.message,
        parameters_evaluated: null,
        output: null,
        id: payload.id,
      })
      throw err
    }
  } else {
    console.log(payload.code + ': Condition not met')
    return await DBConnect.executedActionStatusUpdate({
      status: ActionQueueStatus.ConditionNotMet,
      error_log: '',
      parameters_evaluated: null,
      output: null,
      id: payload.id,
    })
  }
}
