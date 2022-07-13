import { combineRequestParams } from '../utilityFunctions'
import { processTrigger } from './processTrigger'
import { Trigger } from '../../generated/graphql'
import { Duration } from 'luxon'

export const routeExtendApplication = async (request: any, reply: any) => {
  const { applicationId, eventCode, extensionTime } = combineRequestParams(request, 'camel')

  const extensionDuration =
    Number(extensionTime) === NaN
      ? extensionTime
      : Duration.fromObject({ days: Number(extensionTime) })

  // A dummy triggerPayload object, as though it was retrieved from the
  // trigger_queue table
  const triggerPayload = {
    trigger_id: null,
    eventCode,
    trigger: Trigger.OnExtend,
    table: 'application',
    record_id: Number(applicationId),
    applicationDataExtra: { extensionDuration },
  }

  const actionsOutput = await processTrigger(triggerPayload)
  return reply.send({ actionsOutput })
}
