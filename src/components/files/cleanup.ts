/*
Script to handle file clean up.
- Identifies any files in the "files" folder that are not registered in the
  database ("file" table) and deletes them. 
- Also removes file records from "file" table that are no longer present in the
  file system.
*/

import DBConnect from '../databaseConnect'
import { DateTime } from 'luxon'
import fs from 'fs'
import { filesFolder } from '../files/fileHandler'
import path from 'path'
import { getAppEntryPointDir } from '../utilityFunctions'
import { crawlFileSystem } from '../utilityFunctions'
import { deleteFile } from '../files/deleteFiles'

const basePath: string = path.join(getAppEntryPointDir(), filesFolder) // declares the file storage path
const isManualCleanup: Boolean = process.argv[2] === '--cleanup'

const checkFile = async (filePath: string) => {
  console.log('file', filePath, await DBConnect.checkIfInFileTable(filePath))
  //   if (await DBConnect.checkIfInFileTable(filePath)) {
  //     const file: { filePath: string } = { filePath: filePath.slice(basePath.length) }
  //     deleteFile(file)
  //   }
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

export const cleanUpFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Cleaning up files and file records...'
  )
  await crawlFileSystem(basePath, checkFile)
  // await processMissingFileLinks()
  // const deleteCount = await DBConnect.cleanUpFiles()
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
