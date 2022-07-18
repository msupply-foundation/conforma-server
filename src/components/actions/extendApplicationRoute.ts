import { combineRequestParams } from '../utilityFunctions'
import { PermissionPolicyType, Trigger } from '../../generated/graphql'
import { DateTime } from 'luxon'
import DBConnect from '../databaseConnect'
import { getPermissionNamesFromJWT } from '../data_display/helpers'
import { getTokenData } from '../permissions/loginHelpers'

export const routeExtendApplication = async (request: any, reply: any) => {
  const { applicationId, eventCode, extensionTime, data } = combineRequestParams(request, 'camel')

  // Check permissions first -- currently we just check user has ANY Reviewing
  // permissions for current template.
  // TO-DO: define specific permission names required for extending deadlines
  const { permissionNames: userPermissions } = await getPermissionNamesFromJWT(request)

  const templatePermissions = (
    await DBConnect.getTemplatePermissionsFromApplication(Number(applicationId))
  )
    .filter(
      (permission: any) =>
        permission?.permissionName?.permissionPolicy?.type === PermissionPolicyType.Review
    )
    .map((permission: any) => permission?.permissionName?.name)

  const hasPermission = userPermissions.some((permission) =>
    templatePermissions.includes(permission)
  )

  if (!hasPermission) return reply.send({ success: false, message: 'Unauthorized' })

  const { userId } = request.auth

  try {
    const event = await DBConnect.getScheduledEvent(applicationId, eventCode)
    if (!event) return reply.send({ success: false, message: 'No matching event found' })

    // If time is a number, we consider it as number of days. Otherwise a Luxon
    // duration object can be provided for more specificity
    const duration = isNaN(Number(extensionTime)) ? extensionTime : { days: Number(extensionTime) }

    // If event is in the past, we add the duration to the current time,
    // otherwise we add it to the scheduled event time
    const currentScheduledTime = DateTime.fromJSDate(event.time_scheduled)
    const scheduledTime =
      currentScheduledTime < DateTime.now()
        ? DateTime.now().plus(duration).toISO()
        : currentScheduledTime.plus(duration).toISO()

    // Update trigger schedule event
    const extensionResult = await DBConnect.updateScheduledEventTime(
      applicationId,
      eventCode,
      scheduledTime,
      userId
    )

    // Add trigger event directly to trigger_queue so we can include eventCode
    // and any additional data
    await DBConnect.addTriggerEvent({
      trigger: Trigger.OnExtend,
      table: 'application',
      recordId: applicationId,
      eventCode,
      data,
    })

    return reply.send({ success: true, newDeadline: extensionResult.time_scheduled })
  } catch (err) {
    return { success: false, message: err.message }
  }
}
