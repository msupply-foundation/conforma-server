import path from 'path'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import getAppRootDir from './getAppRoot'
import * as config from '../config.json'
import PosgresDB from '../components/postgresConnect'

export const filesFolderName = config.filesFolderName

interface HttpQueryParameters {
  [key: string]: string
}

export function createFilesFolder() {
  try {
    fs.mkdirSync(path.join(getAppRootDir(), filesFolderName))
  } catch {
    // Folder already exists
  }
}

export async function getFilename(id: number) {
  try {
    const result = await PosgresDB.getFile({ id: id })
    const folder = result.path // Not currently used
    const filenameOrig = result.original_filename
    const ext = path.extname(String(filenameOrig))
    const basename = path.basename(filenameOrig, ext)
    return `${basename}_${id}${ext}`
  } catch (err) {
    console.log(err.stack)
  }
}

const pump = util.promisify(pipeline)
export async function saveFiles(data: any, queryParams: HttpQueryParameters) {
  for await (const file of data) {
    await pump(
      file.file,
      fs.createWriteStream(path.join(getAppRootDir(), filesFolderName, file.filename))
    )

    const parameters = { ...queryParams }

    ;['user_id', 'application_id', 'application_response_id'].forEach((field) => {
      const queryFieldValue = queryParams[field]
      const bodyFieldValue = file.fields[field] ? file.fields[field].value : undefined
      parameters[field] = queryFieldValue ? queryFieldValue : bodyFieldValue
    })
    const fileID = await registerFileInDB(file, parameters)
  }
}

async function registerFileInDB(file: any, parameters: any) {
  try {
    // Insert record into Db and get back ID
    const result = await PosgresDB.addFile({
      user_id: parameters.user_id,
      original_filename: file.filename,
      path: filesFolderName,
      mimetype: file.mimetype,
      application_id: parameters.application_id,
      application_response_id: parameters.application_response_id,
    })
    const fileID = result.id
    // Rename file with ID
    const ext = path.extname(file.filename)
    const basename = path.basename(file.filename, ext)
    fs.rename(
      path.join(getAppRootDir(), filesFolderName, file.filename),
      path.join(getAppRootDir(), filesFolderName, `${basename}_${fileID}${ext}`),
      () => {}
    )
  } catch (err) {
    console.log(err.stack)
  }
}
