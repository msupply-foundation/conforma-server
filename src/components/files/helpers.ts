import DBConnect from '../databaseConnect'
import { DateTime } from 'luxon'
import fs from 'fs/promises'
import { move, mkdirp, readJSON, pathExists } from 'fs-extra'
import path from 'path'
import { clearEmptyDirectories } from '../utilityFunctions'
import { ARCHIVE_FOLDER, ARCHIVE_SUBFOLDER_NAME, FILES_FOLDER } from '../../constants'
import config from '../../config'
import { nanoid } from 'nanoid'
import { ArchiveData, ArchiveInfo } from './archive'

export const loadArchiveData = async (source: string) => {
  let archiveData: ArchiveData
  try {
    archiveData = await readJSON(path.join(source, 'archive.json'))
    return archiveData
  } catch {
    return null
  }
}

// Gets a list of system archive sub-folders to export as part of snapshot
export const getArchiveFolders = async (earliest: number | string = 0) => {
  // Load archive history
  const { archives, history } = (await loadArchiveData(ARCHIVE_FOLDER)) ?? {}
  if (!history || !archives) return []

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

// Checks the archive metadata in a snapshot and verifies that the complete
// archive can be restored from the following sources:
// - system archive
// - this snapshot
// - the system snapshots/archives
// - backups (Maybe)
// If not, it returns an error
// If so, returns a list of the paths to all the folders

export const findArchiveSources = async (snapshotFolder: string) => {
  // Load archive metadata and get all UIDs
  const { archives, history } =
    (await loadArchiveData(path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME))) ?? {}

  if (!history || !archives) return []

  const requiredUids = new Set(history.map((archive) => archive.uid))
  const foundSourceFolders: [string, string][] = []

  const sources = [
    path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME),
    path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME),
    // All snapshot/archive subfolders
    // Backups if we can figure out how
  ]

  for (const source of sources) {
    if (await pathExists(source)) {
      const foundArchives = await scanArchive(source)
      foundArchives.forEach((archive) => {
        if (requiredUids.has(archive.uid)) {
          foundSourceFolders.push([source, archive.archiveFolder])
          requiredUids.delete(archive.uid)
        }
      })
      // Stop searching as soon as all required archives found
      if (requiredUids.size === 0) return foundSourceFolders
    }
  }

  // We haven't found all the required archives so throw an informative error
  const missingArchives = Array.from(requiredUids).map(
    (uid) => ` - ${archives[uid].archiveFolder} (${uid})`
  )
  throw new Error(`Missing archive folders:
    ${missingArchives.join('\n')}
  `)
}

const scanArchive = async (source: string) => {
  const archives = new Set<ArchiveInfo>()

  const folders = await fs.readdir(source)

  for (const folder of folders) {
    if (!(await fs.stat(path.join(source, folder))).isDirectory()) continue

    try {
      archives.add(await readJSON(path.join(source, folder, 'info.json')))
    } catch {
      throw new Error('Missing info.json in archive: ' + path.join(source, folder))
    }
  }
  return archives
}
