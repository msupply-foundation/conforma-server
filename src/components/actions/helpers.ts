import { merge } from 'lodash'
import { ActionInTemplate } from '../../types'
import DBConnect from '../databaseConnect'
import { FigTreeEvaluator } from 'fig-tree-evaluator'

export async function evaluateParameters(
  figTree: FigTreeEvaluator,
  parameterQueries: { [key: string]: any },
  data: { [key: string]: any } = {}
) {
  const parametersEvaluated: { [key: string]: any } = {}
  try {
    for (const key in parameterQueries) {
      parametersEvaluated[key] = await figTree.evaluate(parameterQueries[key], { data })
    }
    return parametersEvaluated
  } catch (err) {
    console.log(err.message)
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

  if (!aliasedAction) throw new Error('No Action matching alias: ' + code)

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
