import path from 'path'
import fs from 'fs'
import {
  getAppEntryPointDir,
  objectKeysToSnakeCase,
  objectKeysToCamelCase,
  combineRequestParams,
  makeFolder,
} from '../utilityFunctions'
import { getFilePath, registerFileInDB } from '../../../src/components/files/fileHandler'
import { nanoid } from 'nanoid'
import config from '../../config'
import carbone from 'carbone'

const appRootFolder = getAppEntryPointDir()
const filesFolder = config.filesFolder
const PDF_THUMBNAIL = 'noun_PDF_3283219.png'
const PDF_MIMETYPE = 'application/pdf'

export const routeGeneratePDF = async (request: any, reply: any) => {
  const { filePath, fileId, data, userId, applicationSerial, applicationResponseId, subFolder } =
    combineRequestParams(request, 'camel')

  // Existing Document template properties
  const templateFileInfo = await getFilePath(fileId)
  const templatePath = filePath ?? templateFileInfo.file_path
  const templateFullPath = path.join(appRootFolder, filesFolder, templatePath)
  const templateName = path.parse(templateFileInfo.original_filename).name

  // Output file/folder properties
  const uniqueId = nanoid()
  const subfolder = subFolder ?? applicationSerial ?? ''
  if (subfolder) makeFolder(path.join(appRootFolder, filesFolder, subfolder))
  const originalFilename = `${templateName}_${applicationSerial ?? uniqueId}`
  const outputFilename = `${templateName}${
    applicationSerial ? '_' + applicationSerial : ''
  }_${uniqueId}.pdf`
  const outputFilePath = path.join(subfolder, outputFilename)

  const registerFile = async (err: any, result: any) => {
    if (err) return reply.send(err)
    fs.writeFileSync(path.join(appRootFolder, filesFolder, outputFilePath), result)
    console.log('File Done')
    console.log(path.join(appRootFolder, filesFolder, outputFilePath))
    try {
      await registerFileInDB(
        objectKeysToSnakeCase({
          uniqueId,
          originalFilename,
          userId,
          applicationSerial,
          applicationResponseId,
          filePath: outputFilePath,
          thumbnailPath: PDF_THUMBNAIL,
          mimetype: PDF_MIMETYPE,
        })
      )
      return reply.send('DONE')
      return reply.sendFile(path.join(appRootFolder, filesFolder, outputFilePath))
    } catch (err) {
      return reply.send(err)
    }
  }

  try {
    carbone.render(templateFullPath, data, { convertTo: 'pdf' }, registerFile)
  } catch (err) {
    return reply.send(err)
  }
  //   return reply.send('DONE')
}
