import { readJSON } from 'fs-extra'
import path from 'path'
import { SNAPSHOT_ARCHIVE_FOLDER } from '../../constants'
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

// Gets archive data for the current system
export const getCurrentArchives = async () => {
  const currentArchives: ArchiveData = await readJSON(path.join(SNAPSHOT_ARCHIVE_FOLDER, 'archive.json'))

  return currentArchives.history
}

// Gets archive data for a specified snapshot
export const getSnapshotArchives = async (snapshotFolder: string) => {
  try {
    const archives: ArchiveData = await readJSON(path.join(snapshotFolder, `archive.json`))

    return archives.history
  } catch {
    return []
  }
}

// Gets a list of system archive sub-folders to export as part of snapshot
export const getArchiveFolders = async (option: ArchiveOption = 0) => {
  // Load archive history
  const { archives, history } = (await loadArchiveData(SNAPSHOT_ARCHIVE_FOLDER)) ?? {}
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
