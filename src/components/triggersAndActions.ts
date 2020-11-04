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
} from '../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import DBConnect from './databaseConnect'
import { actionLibrary } from './pluginsConnect'
import { BasicObject, IParameters } from '@openmsupply/expression-evaluator/lib/types'

const schedule = require('node-schedule')

const pluginFolder = path.join(getAppRootDir(), config.pluginsFolder)

// Load actions from Database at server startup
export const loadActions = async function (actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  try {
    const result = await DBConnect.getActionPlugins()

    result.forEach((row) => {
      const action = require(path.join(pluginFolder, row.path))
      actionLibrary[row.code] = action[row.function_name]
    })

    console.log('Actions loaded.')
  } catch (err) {
    console.log(err.stack)
  }
}

// Load scheduled jobs from Database at server startup
export const loadScheduledActions = async function (
  actionLibrary: ActionLibrary,
  actionSchedule: any[]
) {
  console.log('Loading Scheduled jobs...')

  // Load from Database
  const actions = await DBConnect.getActionsScheduled()

  let isExecutedAction = true
  for await (const scheduledAction of actions)
    while (isExecutedAction) {
      const date = new Date(scheduledAction.time_completed)
      if (date > new Date(Date.now())) {
        const job = schedule.scheduleJob(date, function () {
          // TODO: Check if was executed otherwise don't continue
          executeAction(
            {
              id: scheduledAction.id,
              code: scheduledAction.action_code,
              trigger_payload: scheduledAction.trigger_payload,
              parameter_queries: scheduledAction.parameter_queries,
            },
            actionLibrary
          )
        })
        actionSchedule.push(job)
      } else {
        // Overdue jobs to be executed immediately
        console.log(
          'Executing overdue action:',
          scheduledAction.action_code,
          scheduledAction.parameters_evaluated
        )
        // TODO: Evaluate parameters at runtime
        executeAction(
          {
            id: scheduledAction.id,
            code: scheduledAction.action_code,
            trigger_payload: scheduledAction.trigger_payload,
            parameter_queries: scheduledAction.parameter_queries,
          },
          actionLibrary
        )
      }
    }

  actionSchedule.length > 0
    ? console.log(`${actionSchedule.length} scheduled jobs loaded.`)
    : console.log('There were no jobs to be loaded.')
}

export async function processTrigger(payload: TriggerPayload) {
  const { id: trigger_id, trigger, table, record_id } = payload

  // Deduce template ID -- different for each triggered table
  const templateId = await DBConnect.getTemplateId(table, record_id)

  // Get Actions from matching Template
  const result = await DBConnect.getActionsByTemplateId(templateId, trigger)

  // Filter out Actions that don't match the current condition
  // and separate into Sequential and Async actions
  const actionsSequential: ActionSequential[] = []
  const actionsAsync: ActionInTemplate[] = []

  for (const action of result) {
    const condition = await evaluateExpression(action.condition, {
      objects: [payload],
      pgConnection: DBConnect,
    })
    if (condition) {
      if (action.sequence) actionsSequential.push(action as ActionSequential)
      else actionsAsync.push(action)
    }
  }

  for (const action of [...actionsAsync, ...actionsSequential]) {
    // Add all actions to Action Queue
    // TODO - better error handling
    await DBConnect.addActionQueue({
      trigger_event: trigger_id,
      template_id: templateId,
      sequence: action.sequence,
      action_code: action.code,
      trigger_payload: payload,
      parameter_queries: action.parameter_queries,
      parameters_evaluated: {},
      status: action.sequence ? 'Processing' : 'Queued',
    })
  }
  await DBConnect.updateTriggerQueueStatus({ status: 'Actions Dispatched', id: trigger_id })

  // Get sequential Actions from database
  const actionsToExecute = await DBConnect.getActionsProcessing(templateId)

  let outputCumulative = {} // Collect output properties of actions in sequence
  // Execute Actions one by one
  for (const action of actionsToExecute) {
    const actionPayload = {
      id: action.id,
      code: action.action_code,
      trigger_payload: action.trigger_payload,
      parameter_queries: action.parameter_queries,
    }
    const result = await executeAction(actionPayload, actionLibrary, [outputCumulative])
    outputCumulative = { ...outputCumulative, ...result.output }
    if (result.status === 'Fail') console.log(result.error_log)
  }
  // After all done, set Trigger on table back to NULL
  DBConnect.resetTrigger(table, record_id)
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
  additionalObjects: BasicObject[] = []
): Promise<ActionQueueExecutePayload> {
  const evaluatorParams = {
    objects: [payload.trigger_payload, ...additionalObjects],
    pgConnection: DBConnect, // Add graphQLConnection, Fetch (API) here when required
  }
  // Evaluate parameters
  const parametersEvaluated = await evaluateParameters(payload.parameter_queries, evaluatorParams)

  // TO-DO: If Scheduled, create a Job instead
  const actionResult = await actionLibrary[payload.code](parametersEvaluated, DBConnect)

  return await DBConnect.executedActionStatusUpdate({
    status: actionResult.status,
    error_log: actionResult.error_log,
    parameters_evaluated: parametersEvaluated,
    output: actionResult.output,
    id: payload.id,
  })
}
