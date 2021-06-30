import path from 'path'
import fs from 'fs'
import util from 'util'
import { getAppEntryPointDir } from '../utilityFunctions'
import { getFilePath, registerFileInDB } from '../../../src/components/files/fileHandler'
import { nanoid } from 'nanoid'
import config from '../../config'
import carbone from 'carbone'

const filesFolder = config.filesFolder

export const routeGeneratePDF = async (request: any, reply: any) => {
  const { filePath, fileId, data, userId, applicationId } = JSON.parse(request.body)
  const localPath = (await getFilePath(fileId)).file_path as string
  const templatePath = path.join(getAppEntryPointDir(), filesFolder, localPath)
  console.log('Template', templatePath)

  await generatePDF(templatePath, data)
  return reply.send('Testing')
}

export const generatePDF = async (templatePath: string, data: any) => {
  carbone.render(templatePath, data, function (err, result) {
    if (err) return err
    // Save file and insert record in database

    // saveFiles[{ filename: 'THis', file: result }]
  })
}
