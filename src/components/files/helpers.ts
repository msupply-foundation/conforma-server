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

// A file's archive_path has the form "<archiveFolder>/files" (see
// archiveFiles); this returns the folder segment.
export const archiveFolderOf = (archivePath: string): string => archivePath.split('/')[0]

// Sorts records whose file is absent from disk by where the file was meant
// to be. A record in the files folder with nothing behind it is stale and
// can go. An archived record is kept whatever caused the gap: archives are
// immutable, so a missing archived file means the archive is absent or
// damaged, and the record is the only remaining link between an application
// and its document. Kept, it shows in the UI as a missing file; deleted, the
// loss would be permanent even once the archive is restored.
export const partitionMissingFiles = <T extends { id: number; archivePath: string | null }>(
  missing: T[]
): { staleRecordIds: number[]; missingArchived: Map<string, number> } => {
  const staleRecordIds: number[] = []
  const missingArchived = new Map<string, number>()
  for (const { id, archivePath } of missing) {
    if (!archivePath) {
      staleRecordIds.push(id)
      continue
    }
    const folder = archiveFolderOf(archivePath)
    missingArchived.set(folder, (missingArchived.get(folder) ?? 0) + 1)
  }
  return { staleRecordIds, missingArchived }
}
