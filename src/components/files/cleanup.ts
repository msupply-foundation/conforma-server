/*
Script to handle overall system file clean up:
- Identifies any files in the "files" folder that are not registered in the
  database ("file" table) and deletes them.
- Removes file records from "file" table whose file is no longer present in
  the "files" folder. Records of archived files are never removed: the
  archive store is immutable, so a missing archived file is reported as a
  warning instead (see partitionMissingFiles).
- Deletes file records and files that have been marked "to_be_deleted" (by
  template actions)
*/

const BATCH_SIZE = 100 // How many file records to scan at a time

import DBConnect from '../database/databaseConnect'
import { DateTime } from 'luxon'
import fs from 'fs'
import path from 'path'
import { clearEmptyDirectories, crawlFileSystem, errorMessage } from '../utilityFunctions'
import { deleteFile } from '../files/deleteFiles'
import { partitionMissingFiles } from './helpers'
import { FILES_FOLDER, GENERIC_THUMBNAILS_FOLDER, SNAPSHOT_ARCHIVE_FOLDER } from '../../constants'
import { pruneZipCacheForRequiredSpace } from '../snapshots/zipFileHandler'
import config from '../../config'

const isManualCleanup: boolean = process.argv[2] === '--cleanup'

interface FilePathData {
  id: number
  filePath: string
  archivePath: string | null
}

const fileExists = async (filePath: string) => {
  try {
    await fs.promises.access(filePath)
    return true
  } catch {
    return false
  }
}

// Finds records whose file is not on disk. Records in the files folder are
// deleted; records in the archive store are kept and reported (see
// partitionMissingFiles for why).
const processMissingFileLinks = async () => {
  const missing: FilePathData[] = []
  let offset = 0
  let filePaths: FilePathData[] = await DBConnect.getFilePaths(BATCH_SIZE, offset)

  while (filePaths.length > 0) {
    await Promise.all(
      filePaths.map(async (file) => {
        if (!(await fileExists(file.filePath))) missing.push(file)
      })
    )
    offset += BATCH_SIZE
    filePaths = await DBConnect.getFilePaths(BATCH_SIZE, offset)
  }

  const { staleRecordIds, missingArchived } = partitionMissingFiles(missing)
  await DBConnect.deleteMissingFileRecords(staleRecordIds)
  await warnAboutMissingArchivedFiles(missingArchived)

  return {
    recordsMissingFiles: staleRecordIds.length,
    archivedFilesMissing: missing.length - staleRecordIds.length,
  }
}

// All that can be done about a gap in the archive store is to make it
// visible. A folder that is absent altogether is called out separately: that
// is the signature of an archive never uploaded to this machine, or a volume
// not mounted, both of which are fixable once noticed.
const warnAboutMissingArchivedFiles = async (missingArchived: Map<string, number>) => {
  if (missingArchived.size === 0) return
  const total = [...missingArchived.values()].reduce((sum, count) => sum + count, 0)
  const lines = [
    `WARNING: ${total} archived file(s) are missing from the archive store. Their file records have been kept.`,
  ]
  const folders = [...missingArchived.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [folder, count] of folders) {
    const folderPresent = await fileExists(path.join(SNAPSHOT_ARCHIVE_FOLDER, folder))
    lines.push(`  - ${folder}: ${count} file(s)${folderPresent ? '' : ' -- ARCHIVE FOLDER ABSENT'}`)
  }
  console.warn(lines.join('\n'))
}

export const cleanUpFiles = async () => {
  try {
    let filesMissingRecords = 0

    // Check if file in database and delete if not
    const checkFile = async (filePath: string) => {
      if (path.dirname(filePath) === GENERIC_THUMBNAILS_FOLDER) return

      const relativeFilePath = filePath.replace(FILES_FOLDER + '/', '')
      const isFileInDatabase = await DBConnect.checkIfInFileTable(relativeFilePath)
      if (!isFileInDatabase) {
        deleteFile({ filePath: relativeFilePath })
        filesMissingRecords++
      }
    }
    console.log(
      DateTime.now().toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS),
      'Cleaning up files and file records...'
    )
    await crawlFileSystem(FILES_FOLDER, checkFile)
    await clearEmptyDirectories(FILES_FOLDER)
    const { recordsMissingFiles, archivedFilesMissing } = await processMissingFileLinks()
    const { toBeDeleted, expiredProtected } = await DBConnect.cleanUpFiles()

    console.log(`\nFiles deleted that weren't in database: ${filesMissingRecords}`)
    console.log(`File records removed due to missing files: ${recordsMissingFiles}`)
    console.log(`Archived files missing (records kept): ${archivedFilesMissing}`)
    console.log(`Additional files cleaned up (e.g. previews): ${toBeDeleted}`)
    console.log(`Expired protected files cleaned up: ${expiredProtected}`)

    const freeSpaceRequiredForZips = config.freeSpaceRequiredForZips
    if (freeSpaceRequiredForZips)
      await pruneZipCacheForRequiredSpace(freeSpaceRequiredForZips * 1024 * 1024 * 1024) // Prune cache if less than specified GB available, to prevent issues with new zip file creation
  } catch (err) {
    console.log('ERROR', errorMessage(err))
  }
}

// Manually launch cleanup with command `yarn cleanup`
if (isManualCleanup) {
  cleanUpFiles().then(() => {
    console.log('File cleanup -- Done!\n')
    process.exit(0)
  })
}

export default cleanUpFiles
