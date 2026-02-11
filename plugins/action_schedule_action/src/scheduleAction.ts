import { errorMessage } from '../../../src/components/utilityFunctions'
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
    extend = false,
    active = true,
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

    const currentScheduledDateTime = extend
      ? await db.getScheduledTrigger({ applicationId, eventCode })
      : null

    const scheduledDateTime = getScheduledDateTime({
      date,
      duration,
      currentScheduledDateTime,
    })
    // Add record
    const scheduledEvent = await db.createOrUpdateTriggerSchedule({
      applicationId,
      templateId,
      scheduledDateTime,
      eventCode,
      data,
      active,
    })
    console.log('Trigger/Action event scheduled:', {
      applicationId,
      eventCode,
      scheduledDateTime,
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
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: errorMessage(error),
    }
  }
}

export default scheduleAction

const getScheduledDateTime = ({
  date,
  duration,
  currentScheduledDateTime,
}: {
  date?: string | Date | object
  duration?: number | object
  currentScheduledDateTime?: Date | null
}): string => {
  const luxDuration = duration
    ? typeof duration === 'number'
      ? Duration.fromObject({ weeks: duration })
      : Duration.fromObject(duration)
    : undefined

  if (date) {
    let luxDate =
      typeof date === 'string'
        ? DateTime.fromISO(date)
        : date instanceof Date
        ? DateTime.fromJSDate(date)
        : DateTime.fromObject(date)

    if (!DateTime.isDateTime(luxDate))
      throw new Error('"date" must be ISO string, JS Date or object in Luxon DateTime format')

    // If a date AND a duration is provided, add the duration to the date
    if (luxDuration) luxDate = luxDate.plus(luxDuration)

    return luxDate.toISO()
  }
  if (duration) {
    // If extending, use the later of current scheduled time or now as reference
    // for adding duration, to avoid accidentally shortening the duration if the
    // action is executed after the originally scheduled time
    const referenceTime =
      currentScheduledDateTime && DateTime.fromJSDate(currentScheduledDateTime) > DateTime.now()
        ? DateTime.fromJSDate(currentScheduledDateTime)
        : DateTime.now()

    if (Duration.isDuration(luxDuration)) return referenceTime.plus(luxDuration).toISO()
    throw new Error('"duration" must be a number or object in Luxon Duration')
  }
  throw new Error('Requires either "date" or "duration" parameter')
}
