/*
Script to archive files older than a certain threshold
Please see https://github.com/openmsupply/conforma-server/discussions/1059 for details
*/

import DBConnect from '../databaseConnect'
import { DateTime } from 'luxon'
import { move, mkdirp, readJSON, writeJSON } from 'fs-extra'
import path from 'path'
import { clearEmptyDirectories } from '../utilityFunctions'
import { ARCHIVE_FOLDER, ARCHIVE_SUBFOLDER_NAME, FILES_FOLDER } from '../../constants'
import config from '../../config'
import { nanoid } from 'nanoid'

const isManualArchive: Boolean = process.argv[2] === '--archive'

export const archiveFiles = async () => {
  console.log(
    DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
    'Archiving files...'
  )

  // Load archive history
  let fullArchive: { [key: string]: { timestamp: number; archiveFolder: string } } = {}
  try {
    fullArchive = await readJSON(path.join(ARCHIVE_FOLDER, 'archive.json'))
  } catch {
    fullArchive = {}
  }
  const archiveHistory = Object.entries(fullArchive)
    .map(([uid, { timestamp, archiveFolder }]) => ({
      uid,
      timestamp,
      archiveFolder,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  // TO-DO: Verify integrity of existing archive

  // Get file list
  const files = await DBConnect.getFilesToArchive()
  if (files.length === 0) {
    console.log('Nothing to archive')
    return
  }
  // Create archive subfolder
  const timestamp = DateTime.now()
  const timestampString = timestamp.toFormat('yyyy-LL-dd_HH-mm-ss')
  const archivePath = path.join(ARCHIVE_SUBFOLDER_NAME, timestampString)
  await mkdirp(path.join(FILES_FOLDER, archivePath))

  // Move files
  for (const file of files) {
    const newFilePath = path.join(archivePath, file.file_path)
    try {
      await move(path.join(FILES_FOLDER, file.file_path), path.join(FILES_FOLDER, newFilePath))
      file.file_path = newFilePath
    } catch {
      console.log('Problem moving', file.file_path)
    }
    const shouldMoveThumbnail = !file.thumbnail_path.startsWith(config.genericThumbnailsFolderName)

    const newThumbnailPath = shouldMoveThumbnail
      ? path.join(archivePath, file.thumbnail_path)
      : file.thumbnail_path
    if (shouldMoveThumbnail)
      try {
        await move(
          path.join(FILES_FOLDER, file.thumbnail_path),
          path.join(FILES_FOLDER, newThumbnailPath)
        )
        file.thumbnail_path = newThumbnailPath
      } catch {
        console.log('Problem moving thumbnail', file.file_path)
      }
  }

  // Update database
  for (const file of files) {
    await DBConnect.setFileArchived(file)
  }

  await clearEmptyDirectories(FILES_FOLDER)

  // Create info.json
  const prevArchive = archiveHistory.pop()
  const uid = nanoid()
  const archiveInfo = {
    timestamp: timestamp.toMillis(),
    uid,
    previousArchive: prevArchive?.archiveFolder ?? null,
    previousUid: prevArchive?.uid ?? null,
  }

  await writeJSON(path.join(FILES_FOLDER, archivePath, 'info.json'), archiveInfo, { spaces: 2 })

  // Update archive.json
  fullArchive[uid] = { timestamp: timestamp.toMillis(), archiveFolder: timestampString }
  await writeJSON(path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME, 'archive.json'), fullArchive, {
    spaces: 2,
  })

  // Update system info
  await DBConnect.setSystemInfo('archive', uid)
}

// Manually launch archive with command `yarn cleanup`
if (isManualArchive) {
  archiveFiles().then(() => {
    console.log('Archive -- Done!\n')
    process.exit(0)
  })
}

export default archiveFiles
