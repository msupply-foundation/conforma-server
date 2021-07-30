import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import { DateTime } from 'luxon'

const scheduleAction: ActionPluginType = async ({
  parameters,
  applicationData,
  outputCumulative,
  DBConnect,
}) => {
  const db = databaseMethods(DBConnect)
  const {
    applicationId = applicationData?.applicationId,
    templateId = applicationData?.templateId,
    duration, // either number (weeks) or Luxon duration object
    eventCode = null,
    cancel = false,
    data = { outputCumulative },
  } = parameters

  try {
    if (cancel) {
      const cancelledEvent = await db.cancelTriggerSchedule({ applicationId, eventCode })
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: { cancelledEvent },
      }
    }

    const scheduledTime =
      typeof duration === 'number'
        ? DateTime.now().plus({ weeks: duration }).toISO()
        : DateTime.now().plus(duration).toISO()
    // Add record
    const scheduledEvent = await db.createOrUpdateTriggerSchedule({
      applicationId,
      templateId,
      scheduledTime,
      eventCode,
      data,
      cancel,
    })
    console.log('Trigger/Action event scheduled:', { applicationId, eventCode, scheduledTime })
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { scheduledEvent },
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
