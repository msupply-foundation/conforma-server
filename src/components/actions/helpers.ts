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
    parameter_queries: { code, shouldOverrideCondition, ...overrideParams },
  } = action
  if (!code) throw new Error('Missing code in aliased action')

  const aliasedAction = await DBConnect.getSingleTemplateAction(templateId, code)

  if (!aliasedAction) throw new Error('No Action matching alias')

  // Override condition if specified
  // The alias condition (if specified) will take priority over the original
  // action condition. However, the default condition is "true", and we don't
  // want that to ALWAYS override the original action condition. So we ignore it
  // if the alias condition = true. In the event that we actually *want* this to
  // override, the "shouldOverrideCondition" parameter should be set to "true"
  if (condition !== true || shouldOverrideCondition) aliasedAction.condition = condition

  // Override parameters
  aliasedAction.parameter_queries = merge(
    aliasedAction.parameter_queries,
    // All docs generated through here should be preview docs/non-output
    { toBeDeleted: true, isOutputDoc: false },
    overrideParams
  )

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
          displayString:
            result.output?.document?.description ??
            result.output?.document?.filename ??
            'Generated Document',
          fileId: result.output?.document?.uniqueId,
          errorLog: result.errorLog,
        }
      // We're only expecting preview results from sendNotification and generateDoc actions. Fallback for others:
      default:
        return {
          type: 'OTHER',
          status: result.status,
          displayString: `Output of action: ${result.action}`,
          text: JSON.stringify(result.output, null, 2),
          errorLog: result.errorLog,
        }
    }
  })
}
