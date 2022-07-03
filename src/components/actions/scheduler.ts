import DBConnect from '../databaseConnect'
import scheduler from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds

// Instantiate node-scheduler to run scheduled actions periodically
const checkActionSchedule = new scheduler.RecurrenceRule()

checkActionSchedule.hour = config?.hoursSchedule ?? [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
] // every hour by default
if (schedulerTestMode) checkActionSchedule.second = [0, 30]
else checkActionSchedule.minute = 0

// Node scheduler to clean-up preview files periodically
const cleanUpPreviewsSchedule = new scheduler.RecurrenceRule()

cleanUpPreviewsSchedule.hour = config?.previewDocsCleanupSchedule ?? [1] // once per day
if (schedulerTestMode) checkActionSchedule.second = [0, 30]
else checkActionSchedule.minute = 0

scheduler.scheduleJob(checkActionSchedule, () => {
  triggerScheduledActions()
})
scheduler.scheduleJob(cleanUpPreviewsSchedule, () => {
  cleanUpPreviewFiles()
})

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}

export const cleanUpPreviewFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Cleaning up preview files...'
  )
  const deleteCount = await DBConnect.cleanUpPreviewFiles()
  console.log(`${deleteCount} files removed.`)
}
