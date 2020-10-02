import path from 'path'
import getAppRootDir from './getAppRoot'
import * as config from '../config.json'
import { ActionLibrary, ActionInTemplate, TriggerPayload, ActionPayload } from '../types'
import evaluateExpression from '../modules/evaluateExpression/evaluateExpression'
import PosgresDB from '../components/postgresConnect'

const schedule = require('node-schedule')

const pluginFolder = path.join(getAppRootDir(), config.pluginsFolder)

// Load actions from Database at server startup
export const loadActions = async function (actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  try {
    const result = await PosgresDB.getActionPlugins()

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
  const actions = await PosgresDB.getActionsQueued()

  let isExecutedAction = true
  for await (const scheduledAction of actions)
    while (isExecutedAction) {
      const date = new Date(scheduledAction.execution_time)
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
  // Get Actions from matching Template
  const result = await PosgresDB.getActionPluginsByTemplate(payload.table, {
    template_id: payload.record_id,
    trigger: payload.trigger,
  })
  // Filter out Actions that don't match the current condition
  const actions: ActionInTemplate[] = []

  for (const action of result) {
    const condition = await evaluateExpression(action.condition, PosgresDB)
    if (condition) actions.push(action)
  }

  let isAddedAction = true
  // Evaluate parameters for each Action
  for (const action of actions)
    while (isAddedAction) {
      for (const key in action.parameter_queries) {
        action.parameter_queries[key] = await evaluateExpression(
          action.parameter_queries[key],
          PosgresDB
        )
      }
      // Write each Action with parameters to Action_Queue
      isAddedAction = await PosgresDB.addActionQueue({
        trigger_event: payload.id,
        action_code: action.code,
        parameters: action.parameter_queries,
        status: 'Queued',
      })
    }

  // Update trigger queue item with success/failure (and log)
  // If SUCCESS -- Not sure best way to test for this:
  await PosgresDB.updateTriggerQueue({ status: 'Action Dispatched', id: payload.id })
}

export async function executeAction(
  payload: ActionPayload,
  actionLibrary: ActionLibrary
): Promise<boolean> {
  // TO-DO: If Scheduled, create a Job instead
  const actionResult = actionLibrary[payload.code](payload.parameters)
  return await PosgresDB.executeActionQueued({
    status: actionResult.status,
    error_log: actionResult.error,
    id: payload.id,
  })
}
