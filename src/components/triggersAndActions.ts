import {
  ActionLibrary,
  ActionInTemplate,
  TriggerPayload,
  ActionPayload,
  ActionSequential,
  ActionQueueExecutePayload,
  ActionApplicationData,
} from '../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import DBConnect from './databaseConnect'
import { actionLibrary } from './pluginsConnect'
import { BasicObject, IParameters, IQueryNode } from '@openmsupply/expression-evaluator/lib/types'
import { fetchDataFromTrigger } from './triggerFetchData'

const schedule = require('node-schedule')

// Load actions from Database at server startup
export const loadActions = async function (actionLibrary: ActionLibrary) {
  console.log('Loading Actions from Database...')

  try {
    const result = await DBConnect.getActionPlugins()

    result.forEach((row) => {
      // This should import action from index.js (entry point of plugin)
      actionLibrary[row.code] = require(row.path).action
      console.log('Action loaded: ' + row.code)
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
              application_data: scheduledAction.application_data,
              condition_expression: scheduledAction.condition_expression as IQueryNode,
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
            application_data: scheduledAction.application_data,
            condition_expression: scheduledAction.condition_expression as IQueryNode,
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
  const { trigger_id, trigger, table, record_id } = payload

  const applicationData: ActionApplicationData = await fetchDataFromTrigger(payload)

  const templateId = applicationData.templateId

  // console.log('ApplicationData', applicationData)

  // Get Actions from matching Template
  const actions = await DBConnect.getActionsByTemplateId(templateId, trigger)

  // Filter out Actions that don't match the current condition
  // and separate into Sequential and Async actions
  const actionsSequential: ActionSequential[] = []
  const actionsAsync: ActionInTemplate[] = []

  for (const action of actions) {
    // const condition = await evaluateExpression(action.condition, {
    //   objects: { applicationData },
    //   pgConnection: DBConnect,
    // })
    // if (condition) {
    if (action.sequence) actionsSequential.push(action as ActionSequential)
    else actionsAsync.push(action)

    // }
  }

  for (const action of [...actionsAsync, ...actionsSequential]) {
    // Add all actions to Action Queue
    // TODO - better error handling
    await DBConnect.addActionQueue({
      trigger_event: trigger_id,
      template_id: templateId,
      sequence: action.sequence,
      action_code: action.code,
      application_data: applicationData,
      parameter_queries: action.parameter_queries,
      parameters_evaluated: {},
      condition_expression: action.condition,
      status: typeof action.sequence === 'number' ? 'Processing' : 'Queued',
    })
  }
  await DBConnect.updateTriggerQueueStatus({ status: 'Actions Dispatched', id: trigger_id })

  // Get sequential Actions from database
  const actionsToExecute = await DBConnect.getActionsProcessing(templateId)

  let outputCumulative = {} // Collect output properties of actions in sequence

  // Execute sequential Actions one by one
  let actionFailed = ''
  for (const action of actionsToExecute) {
    console.log('Action: ', action.action_code)
    if (actionFailed) {
      await DBConnect.executedActionStatusUpdate({
        status: 'Fail',
        error_log: 'Action cancelled due to failure of previous sequential action ' + actionFailed,
        parameters_evaluated: null,
        output: null,
        id: action.id,
      })
      continue
    }
    // Evaluate condition
    const condition = await evaluateExpression(action.condition_expression as IQueryNode, {
      objects: { applicationData, outputCumulative },
      pgConnection: DBConnect,
    })
    // if (condition) {
    try {
      const actionPayload = {
        id: action.id,
        code: action.action_code,
        application_data: applicationData,
        condition_expression: action.condition_expression as IQueryNode,
        parameter_queries: action.parameter_queries,
      }
      const result = await executeAction(actionPayload, actionLibrary, {
        output: outputCumulative,
      })
      outputCumulative = { ...outputCumulative, ...result.output }
      if (result.status === 'Fail') console.log(result.error_log)
    } catch (err) {
      actionFailed = action.action_code
    }
    // } else {
    //   console.log('Condition not met')
    //   await DBConnect.executedActionStatusUpdate({
    //     status: 'Condition not met',
    //     error_log: null,
    //     parameters_evaluated: null,
    //     output: null,
    //     id: action.id,
    //   })
    //   // Update condition_evaluated field to False
    //   // Reset trigger on Action_queue
    // }
  }
  // After all done, set Trigger on table back to NULL (or Error)
  DBConnect.resetTrigger(table, record_id, actionFailed !== '')
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
  additionalObjects: BasicObject = {}
): Promise<ActionQueueExecutePayload> {
  const evaluatorParams = {
    objects: { applicationData: payload.application_data, ...additionalObjects },
    pgConnection: DBConnect, // Add graphQLConnection, Fetch (API) here when required
  }
  // Evaluate condition
  const condition = await evaluateExpression(
    payload.condition_expression as IQueryNode,
    evaluatorParams
  )
  console.log('Condition expression', payload.condition_expression)
  console.log('Condition ', condition)
  if (condition) {
    try {
      // Evaluate parameters
      const parametersEvaluated = await evaluateParameters(
        payload.parameter_queries,
        evaluatorParams
      )

      // TO-DO: If Scheduled, create a Job instead
      const actionResult = await actionLibrary[payload.code](
        { ...parametersEvaluated, applicationData: payload.application_data },
        DBConnect
      )

      // console.log('Output', actionResult.output) //Enable this to check output

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
        status: 'Fail',
        error_log: "Couldn't execute Action: " + err.message,
        parameters_evaluated: null,
        output: null,
        id: payload.id,
      })
      throw err
    }
  } else {
    console.log('Condition not met')
    return await DBConnect.executedActionStatusUpdate({
      status: 'Condition not met',
      error_log: null,
      parameters_evaluated: null,
      output: null,
      id: payload.id,
    })
  }
}
