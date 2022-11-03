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
import createBackup from '../exportAndImport/backup'

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

const checkFile = async (filePath: string) => {
  if (await DBConnect.checkIfInFileTable(filePath)) {
    const subPath = filePath.slice(basePath.length)
    const file: any = { filePath: subPath }
    deleteFile(file)
  }
}

export const cleanUpFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Cleaning up files and file records...'
  )
  await crawlFileSystem(basePath, checkFile)
  await processMissingFileLinks()
  const deleteCount = await DBConnect.cleanUpFiles()
  if (deleteCount > 0) console.log(`${deleteCount} files removed.`)
}

// Manually launch cleanup with command `yarn cleaup`
if (isManualCleanup) {
  cleanUpFiles().then(() => {
    console.log('Done!\n')
    process.exit(0)
  })
}

const processMissingFileLinks = async () => {
  const filePaths: any = await DBConnect.filePaths()
  await Promise.all(
    filePaths.map(async (filePathObject: { file_path: string }) => {
      if (!fs.existsSync(filePathObject.file_path)) {
        //console.log(filePathObject.file_path)
        DBConnect.setIsMissing(filePathObject.file_path)
      }
    })
  )
}

export default cleanUpFiles
const startBackup = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Starting backup...'
  )
  createBackup(process.env.BACKUPS_PASSWORD)
}
