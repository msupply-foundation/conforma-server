import DBConnect from '../databaseConnect'
import scheduler from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds

// Instantiate node-scheduler to run scheduled actions periodically
const checkActionSchedule = new scheduler.RecurrenceRule()

const hoursSchedule = config.hoursSchedule
checkActionSchedule.hour = hoursSchedule
if (schedulerTestMode) checkActionSchedule.second = [0, 30]
else checkActionSchedule.minute = 0

scheduler.scheduleJob(checkActionSchedule, () => {
  triggerScheduledActions()
})

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}
