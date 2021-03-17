import fs from 'fs'
import path from 'path'
import databaseMethods from './databaseMethods'
interface Response {
  id: number
  code: string
  template_element_id?: number
  application_response_id?: number
  review_response_link_id?: number
  value: { [key: string]: any }
  comment?: string
  decision?: string
  time_updated: any
}

interface ResponsesById {
  [key: number]: Response[]
}

const fileUploadPluginCode = 'fileUpload'

module.exports['processFiles'] = async function (input: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)

  const { applicationData } = input
  const applicationSerial = input?.applicationSerial || applicationData.applicationSerial
  const applicationid = input?.applicationId || applicationData.applicationId
  const {
    environmentData: { appRootFolder, filesFolderName },
  } = applicationData

  console.log(`Processing files associated with Application ${applicationSerial}`)

  try {
    // Get all unsubmitted files for current application
    const files = await db.getApplicationFiles(applicationSerial)

    // Get responses that have uploaded file data
    const fileResponses = (await db.getFileResponses(applicationid, fileUploadPluginCode))
      .map((response: any) => response?.value?.files)
      .flat()

    const responseFileUids = new Set(fileResponses.map((file: any) => file.uniqueId))

    const deletedFiles: any = []
    const submittedFiles: any = []

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
      status: 'Success',
      error_log: '',
      output: {
        deletedFiles,
        submittedFiles,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'Problem cleaning up files:' + error.message,
    }
  }

  async function deleteFile(file: any) {
    try {
      // Delete the file
      await fs.unlink(path.join(appRootFolder, filesFolderName, file.filePath), () => {})
      // Delete the thumbnail, but only if it's in the application folder
      if (file.filePath.split('/')[0] === file.thumbnailPath.split('/')[0])
        await fs.unlink(path.join(appRootFolder, filesFolderName, file.thumbnailPath), () => {})
      // Delete the database record
      await db.deleteFileRecord(file.uniqueId)
      return file
    } catch (err) {
      throw err
    }
  }
}
