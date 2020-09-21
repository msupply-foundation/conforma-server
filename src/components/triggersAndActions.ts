import path from 'path'
import getAppRootDir from './getAppRoot'
import * as config from '../config.json'
import { ActionLibrary, Action, DatabaseResult, TriggerPayload, ActionPayload } from '../types'
import evaluateExpression from '../modules/evaluateExpression/evaluateExpression'
import { Client } from 'pg'

const schedule = require('node-schedule')

const pluginFolder = path.join(getAppRootDir(), config.pluginsFolder)

// Load actions from Database at server startup
export const loadActions = async function (client: Client, actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  client
    .query('SELECT code, path, function_name FROM action_plugin')
    .then((res: DatabaseResult) => {
      res.rows.forEach((row) => {
        const action = require(path.join(pluginFolder, row.path))
        actionLibrary[row.code] = action[row.function_name]
      })
    })

  console.log('Actions loaded')

  // return actionLibrary;
}

// Load scheduled jobs from Database at server startup
export const loadScheduledActions = async function (
  client: Client,
  actionLibrary: ActionLibrary,
  actionSchedule: any[]
) {
  // const actionSchedule: any[] = [];

  console.log('Loading Scheduled jobs')
  // Load from Database
  client
    .query(
      `SELECT id, action_code, parameters, execution_time FROM action_queue WHERE status = 'Scheduled' ORDER BY execution_time`
    )
    .then((res: DatabaseResult) => {
      res.rows.forEach((action) => {
        // console.log(action);
        const date = new Date(action.execution_time)
        if (date > new Date(Date.now())) {
          const job = schedule.scheduleJob(date, function () {
            executeAction(
              client,
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
            client,
            {
              id: action.id,
              code: action.action_code,
              parameters: action.parameters,
            },
            actionLibrary
          )
        }
      })
    })
  // return actionSchedule;
}

export async function processTrigger(client: Client, payload: TriggerPayload) {
  try {
    // Get Actions from matching Template
    const query = `
    SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, condition, parameter_queries 
    FROM template JOIN template_action ON template.id = template_action.template_id
    JOIN action_plugin ON template_action.action_code = action_plugin.code
    WHERE template_id = (SELECT template_id from ${payload.table} WHERE id = $1)
    AND trigger = $2;
    `
    const res = await client.query(query, [payload.record_id, payload.trigger])
    // Filter out Actions that don't match the current condition
    const actions: Action[] = []
    for (const action of res.rows) {
      const condition = await evaluateExpression(action.condition)
      if (condition) actions.push(action)
    }

    // Evaluate parameters for each Action
    for (const action of actions) {
      const parameter_queries = action.parameter_queries
      for (const key in parameter_queries) {
        parameter_queries[key] = await evaluateExpression(parameter_queries[key])
      }
    }

    // Write each Action with parameters to Action_Queue
    const writeQuery = `
    INSERT into action_queue (trigger_event, action_code, parameters, status, time_queued)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `
    actions.forEach((action: Action) => {
      client.query(writeQuery, [payload.id, action.code, action.parameter_queries, 'Queued'])
    })
    // Update trigger queue item with success/failure (and log)
    // If SUCCESS -- Not sure best way to test for this:
    client.query(`UPDATE trigger_queue SET status = 'Action Dispatched' WHERE id = $1`, [
      payload.id,
    ])
  } catch (err) {
    console.log(err.stack)
  }
}

export async function executeAction(
  client: Client,
  payload: ActionPayload,
  actionLibrary: ActionLibrary
) {
  // TO-DO: If Scheduled, create a Job instead
  const actionResult = actionLibrary[payload.code](payload.parameters)
  const updateActionQuery = `
    UPDATE action_queue
    SET status = $1,
    error_log = $2,
    execution_time = CURRENT_TIMESTAMP
    WHERE id = $3
  `
  client.query(updateActionQuery, [actionResult.status, actionResult.error, payload.id])
}
