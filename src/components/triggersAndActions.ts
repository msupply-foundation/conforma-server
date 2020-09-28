import path from 'path'
import getAppRootDir from './getAppRoot'
import * as config from '../config.json'
import { ActionLibrary, Action, DatabaseResult, TriggerPayload, ActionPayload } from '../types'
import evaluateExpression from '../modules/evaluateExpression/evaluateExpression'
// import { Client } from 'pg'
import PosgresDB from '../components/postgresConnect'

const schedule = require('node-schedule')

const pluginFolder = path.join(getAppRootDir(), config.pluginsFolder)

// Load actions from Database at server startup
export const loadActions = async function (actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  const result = await PosgresDB.getActionsByCode()

  result.forEach((row) => {
    const action = require(path.join(pluginFolder, row.path))
    actionLibrary[row.code] = action[row.function_name]
  })

  console.log('Actions loaded')
}

// Load scheduled jobs from Database at server startup
export const loadScheduledActions = async function (
  actionLibrary: ActionLibrary,
  actionSchedule: any[]
) {
  console.log('Loading Scheduled jobs')
  // Load from Database
  const result = await PosgresDB.getActionsScheduled()
  result.forEach((action) => {
    // console.log(action);
    const date = new Date(action.execution_time)
    if (date > new Date(Date.now())) {
      const job = schedule.scheduleJob(date, function () {
        executeAction(
          {
            id: action.id,
            code: action.action_code,
            parameters: action.parameters,
          },
          actionLibrary
        )
      })
      actionSchedule.push(job)
    } else {
      // Overdue jobs to be executed immediately
      console.log('Executing overdue action:', action.action_code, action.parameters)
      executeAction(
        {
          id: action.id,
          code: action.action_code,
          parameters: action.parameters,
        },
        actionLibrary
      )
    }
  })
}

export async function processTrigger(payload: TriggerPayload) {
  try {
    // Get Actions from matching Template
    const result = await PosgresDB.getActionsByTemplate([
      payload.table,
      Number(payload.record_id).toString(),
      payload.trigger,
    ])
    // Filter out Actions that don't match the current condition
    const actions: Action[] = []

    result.forEach((action) => {
      const condition = await evaluateExpression(action.condition)
      if (condition) actions.push(action)
    }

    actions.forEach((action: Action) => {
      const parameter_queries = action.parameter_queries
      // Evaluate parameters for each Action
      for (const key in parameter_queries) {
        parameter_queries[key] = await evaluateExpression(parameter_queries[key])
      }
      // Write each Action with parameters to Action_Queue
      await PosgresDB.addActionQueue({id: payload.id, code: action.code, parameter_queries: action.parameter_queries, status: 'QUEUED'})
    })

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
