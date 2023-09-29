import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import config from '../../config'
import { get as extractProperty } from 'lodash'
import { getPermissionNamesFromJWT } from '../data_display/helpers'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { constructAuthHeader, constructQueryObject } from './helpers'
import { ExternalApiConfigs, QueryParameters, PostRoute } from './types'

interface ExternalApiRequest {
  name: string
  route: string
}

const apiConfigs: ExternalApiConfigs = config?.externalApiConfigs ?? {}

export const routeAccessExternalApi = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, route } = request.params as ExternalApiRequest

  const { baseUrl, routes, authentication } = apiConfigs?.[name]
  if (!baseUrl) {
    throw new Error('No baseUrl defined for API: ' + name)
  }

  const routeConfig = routes?.[route]
  if (!routeConfig) {
    throw new Error('No config definition for Route: ' + route)
  }

  const {
    method,
    url,
    permissions,
    queryParams,
    allowedQueries,
    returnProperty,
    additionalAxiosProperties,
  } = routeConfig

  if (permissions) {
    const { permissionNames } = await getPermissionNamesFromJWT(request)
    const validPermissions = permissions.filter((permission) =>
      permissionNames.includes(permission)
    )

    if (validPermissions.length === 0) {
      reply.status(403)
      return reply.send('Not authorized to view this resource')
    }
  }

  // Generate DATA object for evaluator, either:
  // - full "applicationData" object, but we'd need applicationId somehow
  // - a custom data object with just user/org info (ids in JWT)

  const axiosRequest = {
    method,
    url: path.join(baseUrl, url),
    ...additionalAxiosProperties,
  } as AxiosRequestConfig

  axiosRequest.params = await constructQueryObject(
    request.query as QueryParameters,
    queryParams,
    allowedQueries
  )

  if (method === 'post') {
    const { bodyJson, allowedBodyFields } = routeConfig as PostRoute
    if (request.body || bodyJson) {
      axiosRequest.data = await constructQueryObject(
        request.body as QueryParameters,
        bodyJson,
        allowedBodyFields
      )
    }
  }

  constructAuthHeader(authentication, axiosRequest)

  try {
    const result = (await axios(axiosRequest)).data
    return reply.send(returnProperty ? extractProperty(result, returnProperty, result) : result)
  } catch (err) {
    if (err instanceof AxiosError) {
      reply.status(err.response?.status ?? 500)
      return reply.send(err.message)
    }
    throw new Error('Error processing request')
  }
}
