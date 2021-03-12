import path from 'path'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import { nanoid } from 'nanoid'
import { getAppRootDir } from './utilityFunctions'
import * as config from '../config.json'
import DBConnect from './databaseConnect'

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

export async function getFilePath(uid: string, thumbnail = false) {
  const result = await DBConnect.getFileDownloadInfo(uid, thumbnail)
  if (!result) throw new Error()
  return result
}

const pump = util.promisify(pipeline)

export async function saveFiles(data: any, queryParams: HttpQueryParameters) {
  try {
    for await (const file of data) {
      const ext = path.extname(file.filename)
      const basename = path.basename(file.filename, ext)
      const unique_id = nanoid()
      const file_path = path.join(filesFolderName, `${basename}_${unique_id}${ext}`)
      await pump(file.file, fs.createWriteStream(path.join(getAppRootDir(), file_path)))

      const parameters = { ...queryParams }

      ;['user_id', 'application_id', 'application_response_id'].forEach((field) => {
        const queryFieldValue = queryParams[field]
        const bodyFieldValue = file.fields[field] ? file.fields[field].value : undefined
        parameters[field] = queryFieldValue ? queryFieldValue : bodyFieldValue
      })
      try {
        await registerFileInDB({ unique_id, file, file_path, ...parameters })
      } catch {
        throw 'Problem uploading file'
      }
    }
  } catch {
    throw 'Problem uploading file(s)'
  }
}

async function registerFileInDB({
  unique_id,
  file,
  file_path,
  application_id,
  user_id,
  application_response_id,
}: any) {
  // Insert record into Db and get back ID
  try {
    await DBConnect.addFile({
      user_id,
      unique_id,
      original_filename: file.filename,
      application_id,
      application_response_id,
      file_path,
      thumbnail_path: '',
      mimetype: file.mimetype,
    })
  } catch (err) {
    throw err
  }
}

const splitMimetype = (mimetype: string) => {
  // To-do: parse correctly if mimetype has parameter
  // (e.g. type/subtype;parameter=value)
  const [type, subtype] = mimetype.split('/')
  return { type, subtype }
}
