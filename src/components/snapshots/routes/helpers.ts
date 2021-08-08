import fs from 'fs/promises'
import fsSync from 'fs'
import { SNAPSHOT_FILE_NAME, SNAPSHOT_FOLDER } from '../constants'
import path from 'path'

export const getSnaphotList = async () => {
  const dirents = await fs.readdir(SNAPSHOT_FOLDER, { encoding: 'utf-8', withFileTypes: true })
  const snapshotsNames: string[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (!fsSync.existsSync(path.join(SNAPSHOT_FOLDER, dirent.name, `${SNAPSHOT_FILE_NAME}.json`)))
      continue

    snapshotsNames.push(dirent.name)
  }

  return { snapshotsNames }
}
