import fs from 'fs/promises'
import { readJSON, pathExists } from 'fs-extra'
import path from 'path'
import {
  ARCHIVE_FOLDER,
  ARCHIVE_SUBFOLDER_NAME,
  FILES_FOLDER,
  SNAPSHOT_ARCHIVE_FOLDER,
  SNAPSHOT_FOLDER,
} from '../../constants'
import { ArchiveData, ArchiveInfo } from './archive'
import { ArchiveOption } from '../exportAndImport/types'

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
export const getArchiveFolders = async (option: ArchiveOption = 0) => {
  // Load archive history
  const { archives, history } = (await loadArchiveData(ARCHIVE_FOLDER)) ?? {}
  if (!history || !archives) return []

  const from = typeof option === 'object' ? option.from ?? 0 : option
  const to = typeof option === 'object' ? option.to ?? Infinity : Infinity

  const miniumTimestamp = getTimestamp(from, archives)
  const maximumTimestamp = getTimestamp(to, archives)

  return history
    .filter(
      (archive) => archive.timestamp >= miniumTimestamp && archive.timestamp <= maximumTimestamp
    )
    .map((archive) => archive.archiveFolder)
}

const getTimestamp = (
  timestampOrArchiveId: number | string,
  archives: { [key: string]: ArchiveInfo }
): number => {
  if (typeof timestampOrArchiveId === 'string') {
    const archive = archives[timestampOrArchiveId]
    if (!archive) throw new Error('Invalid Archive ID')
    return archive.timestamp
  } else return timestampOrArchiveId
}

// Checks the archive metadata in a snapshot and verifies that the complete
// archive can be restored from the following sources:
// - system archive
// - this snapshot
// - the system snapshots/archives
// - backups (TO-DO)
// If not, it returns an error
// If so, returns a list of the paths to all the folders

export const findArchiveSources = async (snapshotFolder: string) => {
  // Load archive metadata and get all UIDs
  const { archives, history } =
    (await loadArchiveData(path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME))) ?? {}

  if (!history || !archives) return []

  const requiredUids = new Set(history.map((archive) => archive.uid))
  const foundSourceFolders: [string, string][] = []

  // Yield these one by one so we don't scan larger sources if we find
  // everything we need earlier
  const sources = async function* () {
    yield path.join(FILES_FOLDER, ARCHIVE_SUBFOLDER_NAME)
    yield path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME)

    const snapshotArchives = await getSnapshotArchiveFolders()
    for (const folder of snapshotArchives) {
      yield folder
    }

    const archivesInSnapshots = await getArchivesWithinSnapshots()
    for (const folder of archivesInSnapshots) {
      yield folder
    }

    // TO-DO:
    // Scan Backups, but that will require unzipping so might not be worth it.
  }

  for await (const source of sources()) {
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
    (uid) => ` - ${archives[uid].archiveFolder} (ID: ${uid})`
  )
  throw new Error(`Missing archive folders:
    ${missingArchives.join('\n')}
  `)
}

// Scans a single archive source and return the archives within
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

// Scan /_snapshots/_archives (i.e. "Archive snapshots")
const getSnapshotArchiveFolders = async () => {
  const archiveSnapshotFolders = []

  const archiveSnapshotsContents = await fs.readdir(path.join(SNAPSHOT_ARCHIVE_FOLDER))

  for (const item of archiveSnapshotsContents) {
    const itemPath = path.join(SNAPSHOT_ARCHIVE_FOLDER, item)
    if ((await fs.stat(itemPath)).isDirectory()) archiveSnapshotFolders.push(itemPath)
  }

  return archiveSnapshotFolders
}

// Scan "_ARCHIVE" within individual snapshots
const getArchivesWithinSnapshots = async () => {
  const archiveSnapshotFolders = []

  const snapshotFolders = await fs.readdir(path.join(SNAPSHOT_FOLDER))

  for (const item of snapshotFolders) {
    const itemPath = path.join(SNAPSHOT_FOLDER, item)
    if (!(await fs.stat(itemPath)).isDirectory()) continue
    const itemArchiveFolder = path.join(SNAPSHOT_FOLDER, item, 'files', ARCHIVE_SUBFOLDER_NAME)
    if (!pathExists(itemArchiveFolder)) continue
    archiveSnapshotFolders.push(itemArchiveFolder)
  }

  return archiveSnapshotFolders
}
