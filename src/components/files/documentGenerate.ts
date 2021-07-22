import path from 'path'
import fs from 'fs'
import util from 'util'
import {
  getAppEntryPointDir,
  objectKeysToSnakeCase,
  combineRequestParams,
  makeFolder,
} from '../utilityFunctions'
import { getFilePath, registerFileInDB } from '../../../src/components/files/fileHandler'
import { nanoid } from 'nanoid'
import config from '../../config'
import { render, RenderCallback, RenderOptions } from 'carbone'

const appRootFolder = getAppEntryPointDir()
const filesFolder = config.filesFolder
const PDF_THUMBNAIL = 'noun_PDF_3283219.png'
const PDF_MIMETYPE = 'application/pdf'

// Carbone render function wrapped in anonymous function so Promisify has a fixed number of args
const carboneRender = util.promisify(
  (path: string, data: object, options: RenderOptions, fn: RenderCallback) =>
    render(path, data, options, fn)
)

export const routeGeneratePDF = async (request: any, reply: any) => {
  try {
    const file = await generatePDF(combineRequestParams(request, 'camel'))
    return reply.sendFile(file.filePath)
  } catch (err) {
    return reply.send(err)
  }
}

interface GeneratePDFInput {
  fileId: string
  data: object
  userId?: number
  applicationSerial?: string
  applicationResponseId?: number
  subFolder?: string
}

export async function generatePDF({
  fileId,
  data,
  userId,
  applicationSerial,
  applicationResponseId,
  subFolder,
}: GeneratePDFInput) {
  // Existing Carbone Template properties
  const templateFileInfo = await getFilePath(fileId)
  const templatePath = templateFileInfo?.file_path
  const templateFullPath = path.join(appRootFolder, filesFolder, templatePath as string)
  const templateName = path.parse(templateFileInfo?.original_filename).name

  // Output file/folder properties
  const uniqueId = nanoid()
  const subfolder = subFolder ?? applicationSerial ?? ''
  if (subfolder) makeFolder(path.join(appRootFolder, filesFolder, subfolder))
  const originalFilename = `${templateName}_${applicationSerial ?? uniqueId}.pdf`
  const outputFilename = `${templateName}${
    applicationSerial ? '_' + applicationSerial : ''
  }_${uniqueId}.pdf`
  const outputFilePath = path.join(subfolder, outputFilename)

  console.log('Generating document: ' + originalFilename)

  try {
    const result = await carboneRender(templateFullPath, data, { convertTo: 'pdf' })
    fs.writeFileSync(path.join(appRootFolder, filesFolder, outputFilePath), result)
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
    console.log('Document creation complete\n')
    return { uniqueId, filename: originalFilename, filePath: outputFilePath }
  } catch (err) {
    throw err
  }
}
