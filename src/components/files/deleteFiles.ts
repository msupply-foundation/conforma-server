import fs from 'fs'
import path from 'path'
import { FILES_FOLDER } from '../snapshots/constants'

interface FileDetail {
  id: number
  uniqueId: string
  originalFilename: string
  filePath: string
  thumbnailPath: string
}

export const deleteFile = async (file: FileDetail) => {
  const { filePath, thumbnailPath, originalFilename } = file
  try {
    await fs.unlink(path.join(FILES_FOLDER, filePath), () => {})
    await fs.unlink(path.join(FILES_FOLDER, thumbnailPath), () => {})
    console.log(`File deleted: ${originalFilename}`)
  } catch (err) {
    console.log(err)
  }
}
