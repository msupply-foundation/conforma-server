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

export const getSnapshotList = async () => {
  const dirents = await fs.readdir(SNAPSHOT_FOLDER, { encoding: 'utf-8', withFileTypes: true })
  const snapshots: (SnapshotInfo & { name: string; size: number })[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (
      !(
        fsSync.existsSync(path.join(SNAPSHOT_FOLDER, dirent.name, `${SNAPSHOT_FILE_NAME}.json`)) ||
        fsSync.existsSync(path.join(SNAPSHOT_FOLDER, dirent.name, `database.dump`))
      )
    )
      continue

    let size: number | null = null
    try {
      size = (await fs.stat(path.join(SNAPSHOT_FOLDER, `${dirent.name}.zip`))).size
    } catch {
      size = null
    }

    const info = await fse.readJson(
      path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)
    )

    const snapshotId = info.id ?? ''

    snapshots.push({ name: dirent.name.replace(`_${snapshotId}`, ''), size, ...info })
  }

  snapshots.sort(
    (a, b) => DateTime.fromISO(b.timestamp).toMillis() - DateTime.fromISO(a.timestamp).toMillis()
  )

  return snapshots
}

export const getSnapshotArchiveList = async () => {
  const archiveSnapshotFolder = path.join(SNAPSHOT_FOLDER, SNAPSHOT_ARCHIVES_FOLDER_NAME)
  const dirents = await fs.readdir(archiveSnapshotFolder, {
    encoding: 'utf-8',
    withFileTypes: true,
  })
  const snapshots: (SnapshotInfo & { name: string })[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (!fsSync.existsSync(path.join(archiveSnapshotFolder, dirent.name, `${INFO_FILE_NAME}.json`)))
      continue

    const info = await fse.readJson(
      path.join(archiveSnapshotFolder, dirent.name, `${INFO_FILE_NAME}.json`)
    )

    let size: number | null = null
    try {
      size = (await fs.stat(path.join(archiveSnapshotFolder, `${dirent.name}.zip`))).size
    } catch {
      size = null
    }

    snapshots.push({ name: dirent.name, size, ...info })
  }

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
