import { ActionLibrary, ActionPayload, ActionQueueExecutePayload } from '../../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import functions from './evaluatorFunctions'
import DBConnect from '../databaseConnect'
import fetch from 'node-fetch'
import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import { getApplicationData } from './getApplicationData'
import { ActionQueueStatus } from '../../generated/graphql'
import config from '../../config'
import { evaluateParameters } from './helpers'

// Dev config
const showApplicationDataLog = false

const graphQLEndpoint = config.graphQLendpoint

export async function executeAction(
  payload: ActionPayload,
  actionLibrary: ActionLibrary,
  additionalObjects: any = {}
): Promise<ActionQueueExecutePayload> {
  // Get fresh applicationData for each Action
  const applicationData = await getApplicationData({ payload })

  // Debug helper console.log to inspect applicationData:
  if (showApplicationDataLog) console.log('ApplicationData: ', applicationData)

  const evaluatorParams = {
    objects: { applicationData, functions, ...additionalObjects },
    pgConnection: DBConnect,
    APIfetch: fetch,
    graphQLConnection: { fetch, endpoint: graphQLEndpoint },
  }

  // Evaluate condition
  let condition
  try {
    condition = await evaluateExpression(
      payload.condition_expression as EvaluatorNode,
      evaluatorParams
    )
  } catch (err) {
    console.log('>> Error evaluating condition for action:', payload.code)
    const actionResult = {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem evaluating condition: ' + err,
      parameters_evaluated: null,
      output: null,
      id: payload.id,
    }
    await DBConnect.executedActionStatusUpdate(actionResult)
    return actionResult
  }

  if (condition) {
    try {
      // Evaluate parameters
      const parametersEvaluated = await evaluateParameters(
        payload.parameter_queries,
        evaluatorParams
      )
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
