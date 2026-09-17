import FigTree from '../fig-tree-evaluator/FigTree'
import { QueryParameters } from './types'
import { ActionApplicationData } from '../../types'
import { EvaluatorNode } from 'fig-tree-evaluator'

// Build a data object, for either url query params or JSON body data, using:
// - values from HTTP request, filtered for allowed fields only
// - values from Route configuration, evaluated using FigTree evaluator
const constructQueryObject = async (
  requestQuery: QueryParameters = {},
  configQuery: QueryParameters = {},
  allowedFields: string[] | undefined,
  objects: { applicationData?: ActionApplicationData; user: { [key: string]: any } }
) => {
  const allowedRequestQueries = Object.fromEntries(
    Object.entries(requestQuery).filter(([key, _]) =>
      allowedFields ? allowedFields?.includes(key) : true
    )
  )

  const routeConfigKeys = Object.keys(configQuery)
  const routeConfigValues = Object.values(configQuery)

  const evaluatedValues = await Promise.all(
    routeConfigValues.map((value) => FigTree.evaluate(value, { data: objects }))
  )

  const routeConfigData = Object.fromEntries(
    routeConfigKeys.map((key, index) => [key, evaluatedValues[index]])
  )

  return { ...allowedRequestQueries, ...routeConfigData }
}

const validateResult = async (
  validationExpression: EvaluatorNode | undefined,
  result: unknown,
  query: QueryParameters,
  evaluatorData: object
) => {
  if (!validationExpression) return true

  return await FigTree.evaluate(validationExpression, { data: { ...evaluatorData, query, result } })
}

export { constructQueryObject, validateResult }
