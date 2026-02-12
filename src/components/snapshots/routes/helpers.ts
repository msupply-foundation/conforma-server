import fs from 'fs/promises'
import fsSync from 'fs'
import fsx from 'fs-extra'
import getFolderSize from 'get-folder-size'
import {
  ARCHIVE_SUBFOLDER_NAME,
  FILES_FOLDER,
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVES_FOLDER_NAME,
  SNAPSHOT_FILE_NAME,
  SNAPSHOT_FOLDER,
} from '../../../constants'
import path from 'path'
import { SnapshotInfo } from '../../exportAndImport/types'
import { has } from 'lodash'

export const timestampStringExpression = /_\d\d\d\d-\d\d-\d\d_\d\d-\d\d-\d\d$/

export const getSnapshotList = async (archive?: boolean) => {
  const sourceFolder = archive
    ? path.join(SNAPSHOT_FOLDER, SNAPSHOT_ARCHIVES_FOLDER_NAME)
    : SNAPSHOT_FOLDER

  const dirents = await fs.readdir(sourceFolder, { encoding: 'utf-8', withFileTypes: true })

  const snapshots: (SnapshotInfo & {
    name: string
    size: number
    modifiedTimestamp: number
    hasZip: boolean
  })[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (!fsSync.existsSync(path.join(sourceFolder, dirent.name, `${INFO_FILE_NAME}.json`))) continue
    if (
      !archive &&
      !(
        (await fsx.pathExists(path.join(sourceFolder, dirent.name, `database.dump`))) ||
        (await fsx.pathExists(path.join(sourceFolder, dirent.name, `${SNAPSHOT_FILE_NAME}.json`)))
      )
    )
      continue

    let size: number | null = null
    let modifiedTimestamp: number | null = null
    let hasZip = true
    try {
      const fileInfo = await fs.stat(path.join(sourceFolder, `${dirent.name}.zip`))
      size = fileInfo.size
      modifiedTimestamp = fileInfo.mtimeMs
    } catch {
      // If the .zip file doesn't exist, get info from the folder instead
      size = await getFolderSize.loose(path.join(sourceFolder, dirent.name))
      const folderInfo = await fs.stat(path.join(sourceFolder, dirent.name))
      modifiedTimestamp = folderInfo.mtimeMs
      hasZip = false
    }

    const info = await fsx.readJson(path.join(sourceFolder, dirent.name, `${INFO_FILE_NAME}.json`))

    const name = dirent.name.replace(timestampStringExpression, '')

    snapshots.push({ name, filename: dirent.name, size, ...info, modifiedTimestamp, hasZip })
  }

  snapshots.sort((a, b) => b.modifiedTimestamp - a.modifiedTimestamp)

  return snapshots
}

export const getCurrentArchiveList = async () => {
  try {
    const { history } = await fsx.readJson(
      path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME, 'archive.json')
    )
    return history
  } catch {
    return []
  }
}
