import path from 'path'
import { getAppRootDir } from './utilityFunctions'
import * as config from '../config.json'
import {
  ActionLibrary,
  ActionInTemplate,
  TriggerPayload,
  ActionPayload,
  ActionSequential,
} from '../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import DBConnect from './databaseConnect'
import { actionLibrary } from './pluginsConnect'

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
          // TODO: Check if was exectued otherwise don't continue
          executeAction(
            {
              id: scheduledAction.id,
              code: scheduledAction.action_code,
              parameters: scheduledAction.parameters,
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
          scheduledAction.parameters
        )
        executeAction(
          {
            id: scheduledAction.id,
            code: scheduledAction.action_code,
            parameters: scheduledAction.parameters,
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
  // Deduce template ID -- different for each triggered table

  const { id: trigger_id, trigger, table, record_id } = payload

  const templateID = await DBConnect.getTemplateId(table, record_id)

  // Get Actions from matching Template
  const result = await DBConnect.getActionsByTemplateId(templateID, trigger)

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

  // Sort sequential Actions into the correct order
  actionsSequential.sort((action1: ActionSequential, action2: ActionSequential) => {
    return action1.sequence - action2.sequence
  })

  for (const actionList of [actionsAsync, actionsSequential]) {
    const status = Object.is(actionList, actionsAsync) ? 'Queued' : 'Processing'
    // Evaluate Parameters for each Async Action
    for (const action of actionList) {
      if (status === 'Queued') {
        for (const key in action.parameter_queries) {
          action.parameter_queries[key] = await evaluateExpression(action.parameter_queries[key], {
            objects: [payload],
            pgConnection: DBConnect,
          })
        }
      }
      // TODO - better error handling
      // Write each Action with parameters to Action_Queue
      await DBConnect.addActionQueue({
        trigger_event: payload.id,
        template_id: templateID,
        action_code: action.code,
        parameters: action.parameter_queries,
        status,
      })
    }
  }

  // Get sequential Actions from database
  const actionsToExecute = await DBConnect.getActionsProcessing(templateID)

  // Evaluate parameters and execute Actions one by one, updating database status after completion
  for (const action of actionsToExecute) {
    for (const key in action.parameters) {
      action.parameters[key] = await evaluateExpression(action.parameters[key], {
        objects: [payload],
        pgConnection: DBConnect,
      })
    }
    const actionPayload = {
      id: action.id,
      code: action.action_code,
      parameters: action.parameters,
    }
    await executeAction(actionPayload, actionLibrary)
  }

  // After all done, set Trigger on table back to NULL
  DBConnect.resetTrigger(table, record_id)
}

export async function executeAction(
  payload: ActionPayload,
  actionLibrary: ActionLibrary
): Promise<boolean> {
  // TO-DO: If Scheduled, create a Job instead
  const actionResult = await actionLibrary[payload.code](payload.parameters)

  return await DBConnect.executedActionStatusUpdate({
    status: actionResult.status,
    error_log: actionResult.error,
    id: payload.id,
  })
}
