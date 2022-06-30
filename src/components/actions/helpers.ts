import { ActionInTemplate } from '../../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { BasicObject, IParameters } from '@openmsupply/expression-evaluator/lib/types'
import DBConnect from '../databaseConnect'

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

export const swapOutAliasedActions = async (templateId: number, action: ActionInTemplate) => {
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
  // at for overriding the aliased action's condition, but becauase this has
  // default "true" and can never be null, then we'd always get "true" as the
  // condition. So we only consider the condition field if it's something other
  // than "true". And if we actually *want* it to be "true", then we can
  // override it further by specifying a "condition" field in parameters
  if (condition !== true) aliasedAction.condition = condition
  if (altCondition !== undefined) aliasedAction.condition = altCondition

  // Override parameters
  aliasedAction.parameter_queries = { ...aliasedAction.parameter_queries, ...overrideParams }

  return aliasedAction
}
