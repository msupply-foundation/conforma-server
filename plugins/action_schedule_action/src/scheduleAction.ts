import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import { DateTime } from 'luxon'

// Todo:
// - console output
// - update rather than create if applicationId and code match

const scheduleAction: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const {
    tableName,
    entityId,
    applicationId = applicationData?.applicationId,
    templateId = applicationData?.templateId,
    duration, // either number (weeks) or Luxon duration object
    code = null,
  } = parameters

  try {
    const scheduledTime =
      typeof duration === 'number'
        ? DateTime.now().plus({ weeks: duration }).toISO()
        : DateTime.now().plus(duration)
    // Add record
    const scheduledAction = await db.createActionSchedule({
      tableName,
      entityId,
      applicationId,
      templateId,
      scheduledTime,
      code,
    })
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { scheduledAction },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default scheduleAction
