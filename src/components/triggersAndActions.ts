import path from 'path'
import getAppRootDir from './getAppRoot'
import * as config from '../config.json'
import { ActionLibrary, Action, DatabaseResult, TriggerPayload, ActionPayload } from '../types'
import evaluateExpression from '../modules/evaluateExpression/evaluateExpression'
import PosgresDB from '../components/postgresConnect'

const schedule = require('node-schedule')

const pluginFolder = path.join(getAppRootDir(), config.pluginsFolder)

// Load actions from Database at server startup
export const loadActions = async function (actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  try {
    const result = await PosgresDB.getActionsByCode()

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
  const result = await PosgresDB.getActionsScheduled()

  for await (const scheduledAction of result) {
    try {
      const date = new Date(scheduledAction.execution_time)
      if (date > new Date(Date.now())) {
        const job = schedule.scheduleJob(date, function () {
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
    } catch (err) {
      console.log(err.stack)
      return
    }
  }

  actionSchedule.length > 0
    ? console.log(`${actionSchedule.length} scheduled jobs loaded.`)
    : console.log('There was no jobs to be loaded.')
}

export async function processTrigger(payload: TriggerPayload) {
  try {
    // Get Actions from matching Template
    const result = await PosgresDB.getActionsByTemplate(payload.table, [
      payload.record_id,
      payload.trigger,
    ])
    // Filter out Actions that don't match the current condition
    const actions: Action[] = []

    for (const action of result) {
      const condition = await evaluateExpression(action.condition)
      if (condition) actions.push(action)
    }

    // Evaluate parameters for each Action
    for (const action of actions) {
      for (const key in action.parameter_queries) {
        action.parameter_queries[key] = await evaluateExpression(action.parameter_queries[key])
      }
      // Write each Action with parameters to Action_Queue
      await PosgresDB.addActionQueue({
        id: payload.id,
        code: action.code,
        parameter_queries: action.parameter_queries,
        status: 'Queued',
      })
    }

    // Update trigger queue item with success/failure (and log)
    // If SUCCESS -- Not sure best way to test for this:
    await PosgresDB.updateTriggerQueue(['Action Dispatched', payload.id])
  } catch (err) {
    console.log(err.stack)
  }
}

export async function executeAction(payload: ActionPayload, actionLibrary: ActionLibrary) {
  // TO-DO: If Scheduled, create a Job instead
  const actionResult = actionLibrary[payload.code](payload.parameters)
  await PosgresDB.executeAction([actionResult.status, actionResult.error, payload.id])
}
