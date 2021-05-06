import fs from 'fs'
import path from 'path'
import databaseMethods from './databaseMethods'
const fsPromises = fs.promises

import { ActionPluginInput } from '../../types'
import { ActionQueueStatus } from '../../../src/generated/graphql'

const fileUploadPluginCode = 'fileUpload'

interface FileInfo {
  uniqueId: string
  applicationResponseId: number
  filePath: string
  thumbnailPath: string
}
interface ResponseValue {
  text?: string
  files?: {
    fileUrl: string
    filename: string
    mimetype: string
    uniqueId: string
    thumbnailUrl: string
  }[]
}

async function cleanupFiles({ parameters, applicationData, DBConnect }: ActionPluginInput) {
  const db = databaseMethods(DBConnect)

  const applicationSerial = parameters?.applicationSerial || applicationData?.applicationSerial
  const applicationid = parameters?.applicationId || applicationData?.applicationId
  const {
    environmentData: { appRootFolder, filesFolder },
  } = applicationData as { environmentData: { appRootFolder: string; filesFolder: string } }

  console.log(`Processing files associated with Application ${applicationSerial}`)

  try {
    // Get all unsubmitted files for current application
    const files = await db.getApplicationFiles(applicationSerial)

    // Get responses that have uploaded file data
    const fileResponses = (await db.getFileResponses(applicationid, fileUploadPluginCode))
      .filter((response: ResponseValue) => response?.files)
      .map((response: ResponseValue) => response.files)
      .flat()

    const responseFileUids = new Set(fileResponses.map((file: FileInfo) => file.uniqueId))

    const deletedFiles: FileInfo[] = []
    const submittedFiles: FileInfo[] = []

    for (const file of files) {
      if (!responseFileUids.has(file.uniqueId)) {
        const resultFile = await deleteFile(file)
        deletedFiles.push(resultFile)
      } else {
        await db.setFileSubmitted(file.uniqueId)
        submittedFiles.push(file)
      }
    }
    console.log('deletedFiles', deletedFiles)
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        deletedFiles,
        submittedFiles,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem cleaning up files: ' + error.message,
    }
  }

  async function deleteFile(file: FileInfo) {
    try {
      // Delete the file
      await fsPromises.unlink(path.join(appRootFolder, filesFolder, file.filePath))
      // Delete the thumbnail, but only if it's in the application folder
      // (i.e. not the generics)
      if (file.filePath.split('/')[0] === file.thumbnailPath.split('/')[0])
        await fsPromises.unlink(path.join(appRootFolder, filesFolder, file.thumbnailPath))
      // Delete the database record
      await db.deleteFileRecord(file.uniqueId)
      return file
    } catch (err) {
      throw err
    }
  }
}

export default cleanupFiles
