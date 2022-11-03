/*
Script to handle file clean up:
- Identifies any files in the "files" folder that are not registered in the
  database ("file" table) and deletes them. 
- Removes file records from "file" table that are no longer present in the
  file system.
- Deletes file records and files that have been marked "to_be_deleted" (by template actions)
*/

const BATCH_SIZE = 100 // How many file records to scan at a time

import DBConnect from '../databaseConnect'
import { DateTime } from 'luxon'
import fs from 'fs'
import path from 'path'
import { getAppEntryPointDir } from '../utilityFunctions'
import { crawlFileSystem } from '../utilityFunctions'
import { deleteFile } from '../files/deleteFiles'
import { FILES_FOLDER } from '../../constants'

const isManualCleanup: Boolean = process.argv[2] === '--cleanup'

const checkFile = async (filePath: string) => {
  const relativeFilePath = filePath.replace(FILES_FOLDER + '/', '')
  const isFileInDatabase = await DBConnect.checkIfInFileTable(relativeFilePath)
  if (!isFileInDatabase) {
    deleteFile({ filePath: relativeFilePath })
  }
}

interface FilePathData {
  id: number
  filePath: string
}
const processMissingFileLinks = async () => {
  const fileIdsToBeDeleted: number[] = []
  let offset = 0
  let filePaths: FilePathData[] = await DBConnect.getFilePaths(BATCH_SIZE, offset)

  while (filePaths.length > 0) {
    filePaths.forEach(({ id, filePath }) => {
      if (!fs.existsSync(path.join(FILES_FOLDER, filePath))) fileIdsToBeDeleted.push(id)
    })
    offset += BATCH_SIZE
    filePaths = await DBConnect.getFilePaths(BATCH_SIZE, offset)
  }

  await DBConnect.deleteMissingFileRecords(fileIdsToBeDeleted)
}

export const cleanUpFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Cleaning up files and file records...'
  )
  //   await crawlFileSystem(basePath, checkFile)
  await processMissingFileLinks()
  //   const deleteCount = await DBConnect.cleanUpFiles()
  // if (deleteCount > 0) console.log(`${deleteCount} files removed.`)
}

// Manually launch cleanup with command `yarn cleanup`
if (isManualCleanup) {
  cleanUpFiles().then(() => {
    console.log('Done!\n')
    process.exit(0)
  })
}

export default cleanUpFiles
