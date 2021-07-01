import path from 'path'
import fs from 'fs'
import util from 'util'
import { pipeline } from 'stream'
import { nanoid } from 'nanoid'
import { getAppEntryPointDir } from '../utilityFunctions'
import config from '../../config'
import DBConnect from '../databaseConnect'
import createThumbnail from './createThumbnails'

export const { filesFolder, imagesFolder } = config
export const filesPath = path.join(getAppEntryPointDir(), filesFolder)

interface HttpQueryParameters {
  [key: string]: string
}

export function createFilesFolder() {
  try {
    fs.mkdirSync(path.join(getAppEntryPointDir(), filesFolder))
  } catch {
    // Folder already exists
  }
  // Move generic thumbnails to files root
  fs.readdir(
    path.join(getAppEntryPointDir(), imagesFolder, 'generic_file_thumbnails'),
    (_, files) => {
      files.forEach((file) =>
        fs.copyFile(
          path.join(getAppEntryPointDir(), imagesFolder, 'generic_file_thumbnails', file),
          path.join(getAppEntryPointDir(), filesFolder, file),
          () => {}
        )
      )
    }
  )
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
    // data is a Promise, so we await it before looping
    for await (const file of data) {
      const ext = path.extname(file.filename)
      const basename = path.basename(file.filename, ext)
      const unique_id = nanoid()

      const subfolder = queryParams?.subFolder ?? queryParams?.application_serial ?? ''

      const file_path = path.join(subfolder, `${basename}_${unique_id}${ext}`)

      // Save file
      if (!fs.existsSync(path.join(getAppEntryPointDir(), filesFolder, subfolder))) {
        fs.mkdirSync(path.join(getAppEntryPointDir(), filesFolder, subfolder))
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
        uniqueId: unique_id,
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

export async function registerFileInDB({
  unique_id,
  original_filename,
  file,
  file_path,
  thumbnail_path,
  application_serial,
  user_id,
  application_response_id,
  mimetype,
}: any) {
  try {
    await DBConnect.addFile({
      user_id,
      unique_id,
      original_filename: file ? file.filename : original_filename,
      application_serial,
      application_response_id,
      file_path,
      thumbnail_path,
      mimetype: file ? file.mimetype : mimetype,
    })
  } catch (err) {
    throw err
  }
}
