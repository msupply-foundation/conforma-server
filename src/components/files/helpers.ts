import DBConnect from '../databaseConnect'
import { DateTime } from 'luxon'
import { move, mkdirp, readJSON, writeJSON } from 'fs-extra'
import path from 'path'
import { clearEmptyDirectories } from '../utilityFunctions'
import { ARCHIVE_FOLDER, ARCHIVE_SUBFOLDER_NAME, FILES_FOLDER } from '../../constants'
import config from '../../config'
import { nanoid } from 'nanoid'
import { ArchiveData, ArchiveInfo } from './archive'

type ArchiveSource = 'system' | 'snapshot' | 'snapshot_archives' | 'backups'

interface GetArchiveProps {
  sources?: ArchiveSource[] | ArchiveSource
  uid?: string
}

// Gets a list of system archive sub-folders to export as part of snapshot
export const getArchiveFolders = async (earliest: number | string = 0) => {
  // Load archive history
  let archiveData: ArchiveData
  try {
    archiveData = await readJSON(path.join(ARCHIVE_FOLDER, 'archive.json'))
  } catch {
    return []
  }
  const { archives, history } = archiveData

  let miniumTimestamp: number

  // Search by UID
  if (typeof earliest === 'string') {
    const earliestArchive = archives[earliest]
    if (!earliestArchive) throw new Error('Invalid Archive ID')
    miniumTimestamp = earliestArchive.timestamp
  } else miniumTimestamp = earliest

  return history
    .filter((archive) => archive.timestamp >= miniumTimestamp)
    .map((archive) => archive.archiveFolder)
}
