import fs from 'fs'
import path from 'path'
const fsPromises = fs.promises
import config from '../../config'
import { getAppEntryPointDir } from '../utilityFunctions'

const { filesFolder, genericThumbnailsFolderName } = config

export const filesPath = path.join(getAppEntryPointDir(), filesFolder)

export interface FileDetail {
  originalFilename?: string
  filePath: string
  thumbnailPath?: string
  // Set when the file lives in the archive store rather than the files folder
  archivePath?: string | null
}

// Removes a file, and its own thumbnail, from the files folder. Archived
// files are never removed: the archive store is immutable, so deleting an
// archived file's record simply leaves the file unreferenced in its archive.
// `root` exists so tests can point at a scratch folder.
export const deleteFile = async (file: FileDetail, root: string = filesPath) => {
  const { filePath, thumbnailPath, originalFilename, archivePath } = file
  if (archivePath) return
  try {
    await fsPromises.unlink(path.join(root, filePath))
    // Don't delete generic (shared) thumbnail files
    if (thumbnailPath && !thumbnailPath.match(genericThumbnailsFolderName)) {
      await fsPromises.unlink(path.join(root, thumbnailPath))
    }
    console.log(`File deleted: ${originalFilename || path.basename(filePath)}`)

    // Also delete folder if it's now empty
    const dir = path.dirname(filePath)
    if ((await fsPromises.readdir(path.join(root, dir))).length === 0)
      await fsPromises.rmdir(path.join(root, dir))
  } catch (err) {
    // Don't log if it's just a missing file -- this is expected sometimes
    if ((err as any)?.code !== 'ENOENT') console.log()
  }
}
