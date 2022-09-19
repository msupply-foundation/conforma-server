import DBConnect from '../databaseConnect'
import scheduler from 'node-schedule'
import config from '../../config'
import { DateTime } from 'luxon'
import fs from 'fs'
import { filesFolder } from '../files/fileHandler'
import path from 'path'
import { getAppEntryPointDir } from '../utilityFunctions'

// Dev config option
const schedulerTestMode = false // Runs scheduler every 30 seconds
const basePath: string = path.join(getAppEntryPointDir(), filesFolder) // declares the file storage path

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

export const cleanUpFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Cleaning up filess and file records...'
  )
  await crawlFileSystem(basePath)
  const deleteCount = await DBConnect.cleanUpFiles()
  if (deleteCount > 0) console.log(`${deleteCount} files removed.`)
}

const crawlFileSystem = async (newPath: string) => {
  fs.readdirSync(newPath).forEach(async (file) => {
    const subPath = path.join(newPath, file)
    if (fs.statSync(subPath).isDirectory()) crawlFileSystem(subPath)
    else if ((await DBConnect.checkIfInFileTable(subPath)) === 0) {
      fs.unlink(subPath, function (err) {
        if (err) throw err
        else console.log(`Deleted file at ${subPath}`)
      })
    }
  })
}

export default cleanUpFiles
