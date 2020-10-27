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
// import PostgresDB from '../components/postgresConnect'
import DBConnect from './databaseConnect'
import { table } from 'console'
import { TemplateAction } from '../generated/graphql'

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

const evaluateTriggerAndUpdateActionQueue = async (
  actions: ActionInTemplate[],
  payload: TriggerPayload,
  templateID: number
) => {
  for (const action of actions) {
    for (const key in action.parameter_queries) {
      action.parameter_queries[key] = await evaluateExpression(action.parameter_queries[key], {
        objects: [payload],
        pgConnection: DBConnect,
      })
    }

    //   // Write each Action with parameters to Action_Queue
    await DBConnect.addActionQueue({
      trigger_event: payload.id,
      template_id: templateID,
      action_code: action.code,
      parameters: action.parameter_queries,
      status: action.sequence ? 'Processing' : 'Queued',
    })
  }
}

export async function processTrigger(payload: TriggerPayload) {
  // Deduce template ID -- different for each triggered table

  const templateID = await DBConnect.getTemplateId(payload.table, payload.record_id)

  // Get Actions from matching Template
  const result = await DBConnect.getActionPluginsByTemplateId(templateID, payload.trigger)

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

  // Evaluate Parameters for each Action

  // Async actions first so they can execute without waiting for sequential Actions

  // Now Sequential:
  // To-do: remove repetition
  for (const action of actionsSequential) {
    for (const key in action.parameter_queries) {
      action.parameter_queries[key] = await evaluateExpression(action.parameter_queries[key], {
        objects: [payload],
        pgConnection: DBConnect,
      })
    }
    // To-do: How to check for individual errors?
    await DBConnect.addActionQueueBatch(actionsSequential)
  }

  // Iterate over Sequential Actions and build Database params

  // Actions to Action queue (status "Processing")

  // Read Actions from from Database (match templateID and "Processing")

  // Execute actions one by one, updating status after completion

  // After all done, set Trigger on table back to NULL

  // Evaluate parameters for each Action
  // for (const action of actions) {
  //   for (const key in action.parameter_queries) {
  //     action.parameter_queries[key] = await evaluateExpression(action.parameter_queries[key], {
  //       objects: [payload],
  //       pgConnection: DBConnect,
  //     })
  //   }
  //   // TODO - Error handling
  //   // Write each Action with parameters to Action_Queue
  //   await DBConnect.addActionQueue({
  //     trigger_event: payload.id,
  //     template_id: templateID,
  //     action_code: action.code,
  //     parameters: action.parameter_queries,
  //     status: 'Queued',
  //   })
  // }

  // // Update trigger queue item with success/failure (and log)
  // // If SUCCESS -- Not sure best way to test for this:
  // await DBConnect.updateTriggerQueue({ status: 'Actions Dispatched', id: payload.id })
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
