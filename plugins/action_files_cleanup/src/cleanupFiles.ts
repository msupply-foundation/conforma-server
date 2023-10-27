import databaseMethods from './databaseMethods'

import { ActionPluginInput } from '../../types'
import { ActionQueueStatus } from '../../../src/generated/graphql'
import { errorMessage } from '../../../src/components/utilityFunctions'

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
    const files = await db.getApplicationResponseFiles(applicationSerial)

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
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Problem cleaning up files: ' + errorMessage(error),
    }
  }

  async function deleteFile(file: FileInfo) {
    try {
      // Delete the database record -- file will be deleted automatically due to
      // database trigger
      await db.deleteFileRecord(file.uniqueId)
      return file
    } catch (err) {
      throw err
    }
  }
}

export default cleanupFiles
