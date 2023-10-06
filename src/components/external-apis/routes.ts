import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import config from '../../config'
import { get as extractProperty } from 'lodash'
import { getPermissionNamesFromJWT } from '../data_display/helpers'
import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { constructAuthHeader, constructQueryObject } from './helpers'
import { ExternalApiConfigs, QueryParameters, PostRoute } from './types'
import { getApplicationData } from '../actions'
import { getUserInfo } from '../permissions/loginHelpers'
import { ActionApplicationData } from '../../types'

interface ExternalApiRequest {
  name: string
  route: string
}

const apiConfigs: ExternalApiConfigs = config?.externalApiConfigs ?? {}

export const routeAccessExternalApi = async (
  request: FastifyRequest & { auth?: { userId?: number; orgId?: number } },
  reply: FastifyReply
) => {
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
    allowedClientQueries,
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

  // Construct data object for subsequent expression evaluator
  const { userId, orgId } = request.auth as { userId?: number; orgId?: number }
  const { user } = await getUserInfo({ userId, orgId })
  const evaluatorData: { user: typeof user; applicationData?: ActionApplicationData } = { user }

  // ApplicationData only available if an applicationId is provided as a query
  // parameter
  const { applicationId } = request.query as { applicationId?: number }
  if (applicationId) evaluatorData.applicationData = await getApplicationData({ applicationId })

  const axiosRequest = {
    method,
    url: path.join(baseUrl, url),
    ...additionalAxiosProperties,
  } as AxiosRequestConfig

  axiosRequest.params = await constructQueryObject(
    request.query as QueryParameters,
    queryParams,
    allowedClientQueries,
    evaluatorData
  )

  if (method === 'post') {
    const { bodyJson, allowedClientBodyFields } = routeConfig as PostRoute
    if (request.body || bodyJson) {
      axiosRequest.data = await constructQueryObject(
        request.body as QueryParameters,
        bodyJson,
        allowedClientBodyFields,
        evaluatorData
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
