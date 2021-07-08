import { actionLibrary } from '../pluginsConnect'
import { getApplicationData } from './getApplicationData'
import { combineRequestParams } from '../utilityFunctions'
import DBConnect from '../databaseConnect'

const routeRunAction = async (request: any, reply: any) => {
  const { actionCode, applicationId, reviewId, parameters } = combineRequestParams(request, 'camel')
  const applicationData = applicationId ? await getApplicationData({ applicationId, reviewId }) : {}
  const actionResult = await actionLibrary[actionCode]({
    parameters,
    applicationData,
    DBConnect,
  })
  return reply.send(actionResult)
}

export default routeRunAction
