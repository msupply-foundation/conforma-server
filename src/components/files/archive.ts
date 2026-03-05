/*
Script to archive files older than a certain threshold
Please see https://github.com/openmsupply/conforma-server/discussions/1059 for details
*/

import DBConnect from '../database/databaseConnect'
import { DateTime } from 'luxon'
import fsx from 'fs-extra'
import path from 'path'
import { clearEmptyDirectories } from '../utilityFunctions'
import { FILES_FOLDER, SNAPSHOT_ARCHIVE_FOLDER } from '../../constants'
import config from '../../config'
import { nanoid } from 'nanoid'

const isManualArchive: boolean = process.argv[2] === '--archive'
const param = Number.parseInt(process.argv[3])
const archiveDays = Number.isNaN(param) ? undefined : param

export interface ArchiveInfo {
  timestamp: number
  archiveFolder: string
  uid: string
  prevArchiveFolder: string | null
  prevUid: string | null
  numFiles: number
  totalFileSize: number
}

export interface ArchiveData {
  archives: { [key: string]: ArchiveInfo }
  history: ArchiveInfo[]
}

export const archiveFiles = async (days: number = config.archiveFileAgeMinimum ?? 7) => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    `Archiving files older than ${days} days...`
  )

  // Load archive history
  let archiveData: ArchiveData
  try {
    archiveData = await fsx.readJSON(path.join(SNAPSHOT_ARCHIVE_FOLDER, 'archive.json'))
  } catch {
    archiveData = { archives: {}, history: [] }
  }

  const { archives, history } = archiveData

  // TO-DO: Verify integrity of existing archive

  // Get file list
  const files = await DBConnect.getFilesToArchive(days)
  if (files.length === 0) {
    console.log('Nothing to archive')
    return null
  }

  const totalFileSize = files.reduce((sum, { file_size }) => sum + Number(file_size), 0)
  const minArchiveSize = config?.archiveMinSize ?? 100
  if (totalFileSize < minArchiveSize * 1_000_000) {
    console.log(
      `Only ${
        parseInt(String(totalFileSize / 100_000)) / 10
      }MB of files to archive -- less than the required minimum ${minArchiveSize}MB ...skipping`
    )
    return null
  }

  // Create archive subfolder in the archive store
  const timestamp = DateTime.now()
  const timestampString = timestamp.toFormat('yyyy-LL-dd_HH-mm-ss')
  const uid = nanoid()
  const folderName = `${timestampString}_${uid.slice(0, 6)}`
  const archiveFilesPath = path.join(SNAPSHOT_ARCHIVE_FOLDER, folderName, 'files')
  await fsx.mkdirp(archiveFilesPath)

  // Move files from FILES_FOLDER into SNAPSHOT_ARCHIVE_FOLDER
  for (const file of files) {
    try {
      await fsx.move(
        path.join(FILES_FOLDER, file.file_path),
        path.join(archiveFilesPath, file.file_path)
      )
      file.archive_path = path.join(folderName, 'files')
    } catch {
      console.log('Problem moving', file.file_path)
    }
    const shouldMoveThumbnail = !file.thumbnail_path.startsWith(config.genericThumbnailsFolderName)

    if (shouldMoveThumbnail)
      try {
        await fsx.move(
          path.join(FILES_FOLDER, file.thumbnail_path),
          path.join(archiveFilesPath, file.thumbnail_path)
        )
      } catch {
        console.log('Problem moving thumbnail', file.file_path)
      }
  }

  // Update database with "archive_path" prefixes
  for (const file of files) {
    await DBConnect.setFileArchived(file)
  }

  await clearEmptyDirectories(FILES_FOLDER)

  // Create metadata
  const prevArchive = history.slice(-1)?.[0]
  const archiveInfo: ArchiveInfo = {
    timestamp: timestamp.toMillis(),
    uid,
    archiveFolder: folderName,
    prevArchiveFolder: prevArchive?.archiveFolder ?? null,
    prevUid: prevArchive?.uid ?? null,
    numFiles: files.length,
    totalFileSize,
  }

  await fsx.writeJSON(
    path.join(SNAPSHOT_ARCHIVE_FOLDER, folderName, 'info.json'),
    archiveInfo,
    { spaces: 2 }
  )

  // Update archive.json
  archives[uid] = archiveInfo
  history.push(archiveInfo)
  await fsx.writeJSON(
    path.join(SNAPSHOT_ARCHIVE_FOLDER, 'archive.json'),
    { archives, history },
    { spaces: 2 }
  )

  // Update system info
  await DBConnect.setSystemInfo('archive', uid)

  console.log(`Archived ${files.length} files`)

  return archiveInfo
}

// Manually launch archive with command `yarn cleanup`
if (isManualArchive) {
  archiveFiles(archiveDays).then(() => {
    console.log('Archive -- Done!\n')
    process.exit(0)
  })
}

export default archiveFiles
