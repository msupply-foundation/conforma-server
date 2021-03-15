import path from 'path'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import { nanoid } from 'nanoid'
import { getAppRootDir } from '../utilityFunctions'
import * as config from '../../config.json'
import DBConnect from '../databaseConnect'
import createThumbnail from './createThumbnails'

export const { filesFolderName } = config
export const filesPath = path.join(getAppRootDir(), filesFolderName)

interface HttpQueryParameters {
  [key: string]: string
}

export function createFilesFolder() {
  try {
    fs.mkdirSync(path.join(getAppRootDir(), filesFolderName))
  } catch {
    // Folder already exists
  }
  // Move generic thumbnails to files root
  fs.readdir(path.join(getAppRootDir(), 'images', 'generic_file_thumbnails'), (_, files) => {
    files.forEach((file) =>
      fs.copyFile(
        path.join(getAppRootDir(), 'images', 'generic_file_thumbnails', file),
        path.join(getAppRootDir(), filesFolderName, file),
        () => {}
      )
    )
  })
}

export async function getFilePath(uid: string, thumbnail = false) {
  const result = await DBConnect.getFileDownloadInfo(uid, thumbnail)
  if (!result) throw new Error()
  return result
}

const pump = util.promisify(pipeline)

export async function saveFiles(data: any, queryParams: HttpQueryParameters) {
  const filesInfo = []
  try {
    for await (const file of data) {
      const ext = path.extname(file.filename)
      const basename = path.basename(file.filename, ext)
      const unique_id = nanoid()

      const subfolder = queryParams?.application_serial || ''

      const file_path = path.join(subfolder, `${basename}_${unique_id}${ext}`)

      // Save file
      if (!fs.existsSync(path.join(getAppRootDir(), filesFolderName, subfolder))) {
        fs.mkdirSync(path.join(getAppRootDir(), filesFolderName, subfolder))
      }

      await pump(file.file, fs.createWriteStream(path.join(filesPath, file_path)))

      // Create thumbnail from saved file
      const thumbnail_path = await createThumbnail({
        filesPath,
        unique_id,
        basename,
        ext,
        subfolder,
        mimetype: file.mimetype,
      })

      // Save file info to database
      await registerFileInDB({ unique_id, file, file_path, thumbnail_path, ...queryParams })

      filesInfo.push({
        filename: file.filename,
        fileUrl: `/file?uid=${unique_id}`,
        thumbnailUrl: `/file?uid=${unique_id}&thumbnail=true`,
        mimetype: file.mimetype,
      })
    }
  } catch (err) {
    throw err
  }
  return filesInfo
}

async function registerFileInDB({
  unique_id,
  file,
  file_path,
  thumbnail_path,
  application_serial,
  user_id,
  application_response_id,
}: any) {
  try {
    await DBConnect.addFile({
      user_id,
      unique_id,
      original_filename: file.filename,
      application_serial,
      application_response_id,
      file_path,
      thumbnail_path,
      mimetype: file.mimetype,
    })
  } catch (err) {
    throw err
  }
}
