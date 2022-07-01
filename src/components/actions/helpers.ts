import { merge } from 'lodash'
import { ActionInTemplate } from '../../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { BasicObject, IParameters } from '@openmsupply/expression-evaluator/lib/types'
import DBConnect from '../databaseConnect'
import { ActionQueueStatus } from '../../generated/graphql'

export async function evaluateParameters(
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

export const swapOutAliasedAction = async (templateId: number, action: ActionInTemplate) => {
  // Fetch aliased action from database
  const {
    condition,
    parameter_queries: { code, condition: altCondition, ...overrideParams },
  } = action
  if (!code) throw new Error('Missing code in aliased action')

  const aliasedAction = await DBConnect.getSingleTemplateAction(templateId, code)

  if (!aliasedAction) throw new Error('No Action matching alias')

  // Override condition if specified
  // It would make most sense for actual condition field to be the one we look
  // at for overriding the aliased action's condition, but because this has
  // default "true" and can never be null, then we'd always get "true" as the
  // condition. So we only consider the condition field if it's something other
  // than "true". And if we actually *want* it to be "true", then we can
  // override it further by specifying a "condition" field in parameters
  if (condition !== true) aliasedAction.condition = condition
  if (altCondition !== undefined) aliasedAction.condition = altCondition

  // Override parameters
  aliasedAction.parameter_queries = merge(aliasedAction.parameter_queries, overrideParams)

  return aliasedAction
}

interface ActionResult {
  action: string // code
  status: ActionQueueStatus
  output: BasicObject | null
  errorLog: string | null
}

interface ActionResultDisplayData {
  type: 'DOCUMENT' | 'NOTIFICATION' | 'OTHER'
  status: ActionQueueStatus
  displayString: string
  text?: string // for email string
  fileId?: string // for generating url in front-end
  errorLog: string | null // if Action failed
}

// Convert the full action output into a simplified format that can be easily
// displayed by the front-end Preview module
export const createDisplayData = (actionsOutput: ActionResult[]): ActionResultDisplayData[] => {
  return actionsOutput.map((result) => {
    switch (result.action) {
      case 'sendNotification':
        return {
          type: 'NOTIFICATION',
          status: result.status,
          displayString: result.output?.notification?.subject ?? 'Email notification',
          text: result.output?.notification?.message,
          errorLog: result.errorLog,
        }
      case 'generateDoc':
        return {
          type: 'DOCUMENT',
          status: result.status,
          displayString: result.output?.document?.filename ?? 'Generated Document',
          fileId: result.output?.document?.uniqueId,
          errorLog: result.errorLog,
        }
      // We're only expecting preview results from sendNotification and generateDoc actions. Fallback for others:
      default:
        return {
          type: 'OTHER',
          status: result.status,
          displayString: `Result of action: ${result.action}`,
          text: JSON.stringify(result.output, null, 2),
          errorLog: result.errorLog,
        }
    }
  })
}
