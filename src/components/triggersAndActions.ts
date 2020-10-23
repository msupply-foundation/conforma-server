import path from 'path'
import { getAppRootDir } from './utilityFunctions'
import * as config from '../config.json'
import { ActionLibrary, ActionInTemplate, TriggerPayload, ActionPayload } from '../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
// import PostgresDB from '../components/postgresConnect'
import DBConnect from './databaseConnect'
import { table } from 'console'

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
  const actions = await DBConnect.getActionsQueued()

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
  // Deduce template ID -- different for each triggered table

  let table, recordId
  if (payload.table === 'action_queue') {
    ;({ table, recordId } = await DBConnect.getOriginalRecordFromActionQueue(
      payload.table,
      payload.record_id
    ))
  } else {
    table = payload.table
    recordId = payload.record_id
  }

  const templateID = await DBConnect.getTemplateId(table, recordId)

  // Get Actions from matching Template
  const result = await DBConnect.getActionPluginsByTemplateId(templateID, payload.trigger)

  // Filter out Actions that don't match the current condition
  const actions: ActionInTemplate[] = []

  for (const action of result) {
    const condition = await evaluateExpression(action.condition, {
      objects: [payload],
      pgConnection: DBConnect,
    })
    if (condition) actions.push(action)
  }

  // Evaluate parameters for each Action
  for (const action of actions) {
    for (const key in action.parameter_queries) {
      action.parameter_queries[key] = await evaluateExpression(action.parameter_queries[key], {
        objects: [payload],
        pgConnection: DBConnect,
      })
    }
    // TODO - Error handling
    // Write each Action with parameters to Action_Queue
    await DBConnect.addActionQueue({
      trigger_event: payload.id,
      action_code: action.code,
      parameters: action.parameter_queries,
      status: 'Queued',
    })
  }

  // Update trigger queue item with success/failure (and log)
  // If SUCCESS -- Not sure best way to test for this:
  await DBConnect.updateTriggerQueue({ status: 'Action Dispatched', id: payload.id })
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
