import { combineRequestParams } from '../utilityFunctions'
import { PermissionPolicyType, Trigger } from '../../generated/graphql'
import { DateTime } from 'luxon'
import DBConnect from '../databaseConnect'
import { getPermissionNamesFromJWT } from '../data_display/helpers'

export const routeExtendApplication = async (request: any, reply: any) => {
  const { applicationId, eventCode, extensionTime } = combineRequestParams(request, 'camel')

  // Check permissions first -- currently we just check user has ANY Reviewing
  // permissions for current template.
  // TO-DO: define specific permission names required for extending deadlines
  const { permissionNames: userPermissions } = await getPermissionNamesFromJWT(request)

  const templatePermissions = (await DBConnect.getTemplatePermissionsFromApplication(applicationId))
    .filter(
      (permission: any) =>
        permission?.permissionName?.permissionPolicy?.type === PermissionPolicyType.Review
    )
    .map((permission: any) => permission?.permissionName?.name)

  const hasPermission = userPermissions.some((permission) =>
    templatePermissions.includes(permission)
  )

  if (!hasPermission) return reply.send({ success: false, message: 'Unauthorized' })

  try {
    // If time is a number, we consider it as number of days. Otherwise a Luxon
    // duration object can be provided for more specificity
    const scheduledTime = isNaN(Number(extensionTime))
      ? DateTime.now().plus(extensionTime).toISO()
      : DateTime.now()
          .plus({ days: Number(extensionTime) })
          .toISO()

    // Upsert trigger schedule event, return error if event doesn't exist
    const extensionResult = await DBConnect.updateScheduledEventTime(
      applicationId,
      eventCode,
      scheduledTime
    )

    if (extensionResult.length === 0)
      return reply.send({ success: false, message: 'No matching event found' })

    // Set trigger so template actions will fire
    await DBConnect.setTrigger('application', applicationId, Trigger.OnExtend)

    return reply.send({ success: true, newDeadline: extensionResult[0].time_scheduled })
  } catch (err) {
    return { success: false, message: err.message }
  }
}
