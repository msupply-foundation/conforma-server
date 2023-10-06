import evaluateExpression from '@openmsupply/expression-evaluator'
import { AxiosRequestConfig } from 'axios'
import { ApiAuthentication, QueryParameters } from './types'
import { getEnvVariableReplacement } from '../utilityFunctions'
import { ActionApplicationData } from '../../types'

// Adds appropriate auth properties to Axios request object (modifies in-place)
const constructAuthHeader = (
  authentication: ApiAuthentication,
  axiosRequest: AxiosRequestConfig
) => {
  switch (authentication.type) {
    case 'Basic':
      const { username, password } = authentication
      axiosRequest.auth = { username, password: getEnvVariableReplacement(password) }
      break

    case 'Bearer':
      const token = getEnvVariableReplacement(authentication.token)
      axiosRequest.headers = { Authorization: `Bearer ${token}` }
      break

    default:
      throw new Error('Invalid authorisation config')
  }
}

// Build a data object, for either url query params or JSON body data, using:
// - values from HTTP request, filtered for allowed fields only
// - values from Route configuration, evaluated using Expression evaluator
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
    routeConfigValues.map((value) => evaluateExpression(value, { objects }))
  )

  const routeConfigData = Object.fromEntries(
    routeConfigKeys.map((key, index) => [key, evaluatedValues[index]])
  )

  return { ...allowedRequestQueries, ...routeConfigData }
}

export { constructAuthHeader, constructQueryObject }
