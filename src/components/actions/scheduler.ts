import DBConnect from '../databaseConnect'
import scheduler from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'
import cleanUpFiles from '../files/cleanup'
import createBackup from '../exportAndImport/backup'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds

// Node-scheduler to run scheduled actions periodically
const checkActionSchedule = schedulerTestMode
  ? { second: [0, 30] }
  : {
      hour: config?.hoursSchedule ?? [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
      ], // every hour by default
      minute: 0,
    }

// Node scheduler to clean-up preview files periodically
const cleanUpPreviewsSchedule = schedulerTestMode
  ? { second: [0, 30] }
  : {
      hour: config?.previewDocsCleanupSchedule ?? [1], // default once per day
      minute: 0,
    }

const backupSchedule = schedulerTestMode
  ? { second: [0, 30] }
  : {
      hour: config?.backupSchedule ?? [1], // default once per day
      minute: 0,
    }

// Node scheduler to export full system backups

// Launch schedulers
scheduler.scheduleJob(checkActionSchedule, () => {
  triggerScheduledActions()
})
scheduler.scheduleJob(cleanUpPreviewsSchedule, () => {
  cleanUpFiles()
})
scheduler.scheduleJob(backupSchedule, () => {
  startBackup()
})

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}

const startBackup = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Starting backup...'
  )
  createBackup(process.env.BACKUPS_PASSWORD)
}
