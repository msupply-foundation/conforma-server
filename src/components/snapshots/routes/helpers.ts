import fs from 'fs/promises'
import fsSync from 'fs'
import fse from 'fs-extra'
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
import { DateTime } from 'luxon'

export const timestampStringExpression = /_\d\d\d\d-\d\d-\d\d_\d\d-\d\d-\d\d$/

export const getSnapshotList = async (archive?: boolean) => {
  const sourceFolder = archive
    ? path.join(SNAPSHOT_FOLDER, SNAPSHOT_ARCHIVES_FOLDER_NAME)
    : SNAPSHOT_FOLDER

  const dirents = await fs.readdir(sourceFolder, { encoding: 'utf-8', withFileTypes: true })

  const snapshots: (SnapshotInfo & { name: string; size: number })[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (!fsSync.existsSync(path.join(sourceFolder, dirent.name, `${INFO_FILE_NAME}.json`))) continue
    if (
      !archive &&
      !(
        (await fse.pathExists(path.join(sourceFolder, dirent.name, `database.dump`))) ||
        (await fse.pathExists(path.join(sourceFolder, dirent.name, `${SNAPSHOT_FILE_NAME}.json`)))
      )
    )
      continue

    let size: number | null = null
    try {
      size = (await fs.stat(path.join(sourceFolder, `${dirent.name}.zip`))).size
    } catch {
      size = null
    }

    const info = await fse.readJson(path.join(sourceFolder, dirent.name, `${INFO_FILE_NAME}.json`))

    const name = dirent.name.replace(timestampStringExpression, '')

    snapshots.push({ name, filename: dirent.name, size, ...info })
  }

  snapshots.sort(
    (a, b) => DateTime.fromISO(b.timestamp).toMillis() - DateTime.fromISO(a.timestamp).toMillis()
  )

  return snapshots
}

export const getCurrentArchiveList = async () => {
  try {
    const { history } = await fse.readJson(
      path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME, 'archive.json')
    )
    return history
  } catch {
    return []
  }
}
