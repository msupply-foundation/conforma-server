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

  console.log(`Processing files associated with Application ${applicationSerial}`)

  try {
    // Get all files where application_serial = current and submitted = false
    const files = await db.getApplicationFiles(applicationSerial)

    console.log('FILES', files)

    const fileResponses = (await db.getFileResponses(applicationid, fileUploadPluginCode))
      .map((response: any) => response?.value?.files)
      .flat()

    console.log('fileResponses', JSON.stringify(fileResponses, null, 2))

    const responseFileUids = new Set(fileResponses.map((file: any) => file.uniqueId))

    console.log('responseFileUids', responseFileUids)

    const deletedFiles = []

    for (const file of files) {
      if (responseFileUids.has(file.uniqueId)) {
        deleteFile(file).then((file) => deletedFiles.push(file))
      }
    }
    // return {
    //   status: 'Success',
    //   error_log: '',
    //   output: {
    //     deletedResponses,
    //     updatedResponses,
    //   },
    // }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem trimming duplicated responses.',
    }
  }
}

const deleteFile = async (file: any) => {
  // Delete the database record
  // Then delete the file
}
