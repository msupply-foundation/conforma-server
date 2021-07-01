import path from 'path'
import fs from 'fs'
import {
  getAppEntryPointDir,
  objectKeysToSnakeCase,
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
  try {
    generatePDF(combineRequestParams(request, 'camel'), reply)
  } catch (err) {
    return reply.send(err)
  }
}

export const generatePDF = async (
  { filePath, fileId, data, userId, applicationSerial, applicationResponseId, subFolder }: any,
  reply: any = null
) => {
  // Existing Carbone Template properties
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

  try {
    carbone.render(templateFullPath, data, { convertTo: 'pdf' }, registerAndReturnFile)
  } catch (err) {
    throw err
  }

  async function registerAndReturnFile(err: any, result: any) {
    if (err) throw err
    fs.writeFileSync(path.join(appRootFolder, filesFolder, outputFilePath), result)
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
      if (reply) return reply.sendFile(outputFilePath)
      return outputFilePath
    } catch (err) {
      throw err
    }
  }
}
