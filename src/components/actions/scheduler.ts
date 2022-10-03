import DBConnect from '../databaseConnect'
import scheduler from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'
import fs from 'fs'
import { filesFolder } from '../files/fileHandler'
import path from 'path'
import { getAppEntryPointDir } from '../utilityFunctions'
import { crawlFileSystem } from '../utilityFunctions'
import { deleteFile } from '../files/deleteFiles'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds
const basePath: string = path.join(getAppEntryPointDir(), filesFolder) // declares the file storage path
const isManualCleanup: Boolean = process.argv[2] === '--cleanup'

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

// Launch schedulers
scheduler.scheduleJob(checkActionSchedule, () => {
  triggerScheduledActions()
})
scheduler.scheduleJob(cleanUpPreviewsSchedule, () => {
  cleanUpFiles()
})

export const triggerScheduledActions = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Checking scheduled actions...'
  )
  DBConnect.triggerScheduledActions()
}

const checkFile = async (filePath: string) => {
  if (await DBConnect.checkIfInFileTable(filePath)) {
    const file: any = { filePath: filePath }
    deleteFile(file)
  }
}

export const cleanUpFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Cleaning up files and file records...'
  )
  await crawlFileSystem(basePath, checkFile)
  const deleteCount = await DBConnect.cleanUpFiles()
  if (deleteCount > 0) console.log(`${deleteCount} files removed.`)
  else console.log('no files removed.')
  process.exit(0)
}

// Manually launch cleanup with command `yarn cleaup`
if (isManualCleanup) {
  cleanUpFiles()
}

export default cleanUpFiles
