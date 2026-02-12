import fs from 'fs/promises'
import fsSync from 'fs'
import fsx from 'fs-extra'
import getFolderSize from 'get-folder-size'
import {
  ARCHIVE_SUBFOLDER_NAME,
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVE_FOLDER,
  SNAPSHOT_FOLDER,
} from '../../../constants'
import path from 'path'
import { SnapshotInfo } from '../../exportAndImport/types'
import { ArchiveInfo } from '../../files/archive'
import { ArchiveStore } from '../ArchiveStore'

export const timestampStringExpression = /_\d\d\d\d-\d\d-\d\d_\d\d-\d\d-\d\d$/

export const getSnapshotList = async () => {
  const dirents = await fs.readdir(SNAPSHOT_FOLDER, { encoding: 'utf-8', withFileTypes: true })

  const archiveStore = await ArchiveStore.create()

  const snapshots: (SnapshotInfo & {
    name: string
    size: number
    timestamp: string
    missingArchives: string[]
    archiveSize: number
    archiveSizeIncomplete: boolean
  })[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (!fsSync.existsSync(path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)))
      continue
    if (
      !(await fsx.pathExists(path.join(SNAPSHOT_FOLDER, dirent.name, `database.dump`))) ||
      !(await fsx.pathExists(path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)))
    )
      continue

    const info = await fsx.readJson(
      path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)
    )

    const size = await getFolderSize.loose(path.join(SNAPSHOT_FOLDER, dirent.name))
    const timestamp: string = info.timestamp

    const snapshotArchiveFolder = path.join(
      SNAPSHOT_FOLDER,
      dirent.name,
      'files',
      ARCHIVE_SUBFOLDER_NAME,
      'archive.json'
    )
    const archives: ArchiveInfo[] = (await fsx.pathExists(snapshotArchiveFolder))
      ? Object.values((await fsx.readJson(snapshotArchiveFolder))?.archives)
      : []

    const archiveFileSizes = archives?.map(({ totalFileSize }) => totalFileSize)

    // Older snapshots don't have file size data stored against them
    const archiveSizeIncomplete = archiveFileSizes.some((fileSize) => !fileSize)

    const archiveSize = archives.reduce((sum, { totalFileSize }) => sum + (totalFileSize ?? 0), 0)

    console.log(dirent.name, archiveSize)

    const missingArchives = archiveStore.getMissing(archives)

    const name = dirent.name.replace(timestampStringExpression, '')

    snapshots.push({
      name,
      filename: dirent.name,
      size,
      ...info,
      timestamp,
      missingArchives,
      archiveSize,
      archiveSizeIncomplete,
    })
  }

  snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return snapshots
}

export const getArchiveStore = async () => {
  const store: Record<string, ArchiveInfo> = {}
  const dirents = await fs.readdir(SNAPSHOT_ARCHIVE_FOLDER, {
    encoding: 'utf-8',
    withFileTypes: true,
  })
  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (
      !fsSync.existsSync(path.join(SNAPSHOT_ARCHIVE_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`))
    )
      continue

    const info: ArchiveInfo = await fsx.readJson(
      path.join(SNAPSHOT_ARCHIVE_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)
    )
    store[info.uid] = info
  }
  return store
}

// export const getCurrentArchiveList = async () => {
//   try {
//     const { history } = await fsx.readJson(
//       path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME, 'archive.json')
//     )
//     return history
//   } catch {
//     return []
//   }
// }
