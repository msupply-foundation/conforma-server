import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import { DateTime, Duration } from 'luxon'

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
    date, // either ISO string, JSDate or object in Luxon DateTime format
    duration, // either number (weeks) or object in Luxon Duration format
    eventCode = null,
    cancel = false,
    data = { outputCumulative },
  } = parameters

  try {
    if (cancel) {
      const cancelledEvent = await db.cancelTriggerSchedule({ applicationId, eventCode })
      console.log('Event cancelled:', { applicationId, eventCode })
      return {
        status: ActionQueueStatus.Success,
        error_log: '',
        output: { cancelledEvent },
      }
    }

    const scheduledDateTime = getScheduledDateTime({ date, duration })
    // Add record
    const scheduledEvent = await db.createOrUpdateTriggerSchedule({
      applicationId,
      templateId,
      scheduledTime: scheduledDateTime,
      eventCode,
      data,
      cancel,
    })
    console.log('Trigger/Action event scheduled:', {
      applicationId,
      eventCode,
      scheduledTime: scheduledDateTime,
    })
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        scheduledEvent: {
          id: scheduledEvent.id,
          eventCode: scheduledEvent.event_code,
          applicationId: scheduledEvent.application_id,
          templateId: scheduledEvent.template_id,
          timeScheduled: scheduledEvent.time_scheduled,
          isActive: scheduledEvent.is_active,
        },
      },
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

const getScheduledDateTime = ({
  date,
  duration,
}: {
  date?: string | Date | object
  duration?: number | object
}): string => {
  if (date) {
    if (typeof date === 'string') return date
    if (date instanceof Date) return DateTime.fromJSDate(date).toISO()
    const luxDate = DateTime.fromObject(date)
    if (DateTime.isDateTime(luxDate)) return luxDate.toISO()
    throw new Error('"date" must be ISO string, JS Date or object in Luxon DateTime format')
  }
  if (duration) {
    if (typeof duration === 'number') return DateTime.now().plus({ weeks: duration }).toISO()
    const luxDuration = Duration.fromObject(duration)
    if (Duration.isDuration(luxDuration)) return DateTime.now().plus(duration).toISO()
    throw new Error('"duration" must be a number or object in Luxon Duration')
  }
  throw new Error('Requires either "date" or "duration" parameter')
}
