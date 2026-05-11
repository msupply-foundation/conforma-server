import fs from 'fs/promises'
import fsx from 'fs-extra'
import path from 'path'
import getFolderSize from 'get-folder-size'
import {
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVE_FOLDER,
  SNAPSHOT_FOLDER,
  ARCHIVE_SUBFOLDER_NAME,
} from '../../constants'
import { ArchiveData, ArchiveInfo } from '../files/archive'
import { SnapshotInfo } from '../exportAndImport/types'
import { timestampStringExpression } from './routes/helpers'

export type SnapshotListEntry = {
  name: string
  filename: string
  timestamp: string
  version: string
  size: number
  archiveSize: number
  missingArchives: string[]
  isLegacy: boolean
  archiveUids: string[]
}

const infoFile = (folder: string) => path.join(folder, `${INFO_FILE_NAME}.json`)

// ---------- Size population helpers ----------

// Measures snapshot folder size and sums archive sizes from the central
// archive map (falling back to the snapshot's own archive.json for legacy
// archives no longer in the central store).
export const measureSnapshotSizes = async (
  snapshotFolder: string,
  archives: Record<string, ArchiveInfo>
): Promise<{ snapshotSize: number; archiveSize: number }> => {
  const snapshotSize = await getFolderSize.loose(snapshotFolder)
  const archiveJsonPath = path.join(snapshotFolder, 'archive.json')
  let archiveSize = 0
  if (await fsx.pathExists(archiveJsonPath)) {
    const data: ArchiveData = await fsx.readJson(archiveJsonPath)
    for (const a of data.history ?? []) {
      archiveSize += archives[a.uid]?.totalFileSize ?? a.totalFileSize ?? 0
    }
  }
  return { snapshotSize, archiveSize }
}

// Reads info.json, fills in missing snapshotSize/archiveSize, writes back.
// Idempotent — concurrent callers will measure the same value and produce
// equivalent writes (last-writer-wins is benign).
export const ensureSnapshotSizes = async (
  snapshotFolder: string,
  archives: Record<string, ArchiveInfo>
): Promise<SnapshotInfo> => {
  const info: SnapshotInfo = await fsx.readJson(infoFile(snapshotFolder))
  if (info.snapshotSize !== undefined && info.archiveSize !== undefined) return info
  const { snapshotSize, archiveSize } = await measureSnapshotSizes(snapshotFolder, archives)
  info.snapshotSize = snapshotSize
  info.archiveSize = archiveSize
  await fsx.writeJson(infoFile(snapshotFolder), info, { spaces: 2 })
  return info
}

// Always recomputes both fields, regardless of what's currently in info.json.
// Use after operations that mutate the snapshot (e.g. legacy in-place
// conversion) where existing values are stale.
export const rewriteSnapshotSizes = async (
  snapshotFolder: string,
  archives: Record<string, ArchiveInfo>
): Promise<SnapshotInfo> => {
  const info: SnapshotInfo = (await fsx.pathExists(infoFile(snapshotFolder)))
    ? await fsx.readJson(infoFile(snapshotFolder))
    : ({} as SnapshotInfo)
  const { snapshotSize, archiveSize } = await measureSnapshotSizes(snapshotFolder, archives)
  info.snapshotSize = snapshotSize
  info.archiveSize = archiveSize
  await fsx.writeJson(infoFile(snapshotFolder), info, { spaces: 2 })
  return info
}

// Reads an archive's info.json and fills in totalFileSize if missing,
// writing the result back to disk so subsequent loads don't re-measure.
export const ensureArchiveSize = async (archiveFolder: string): Promise<ArchiveInfo> => {
  const info: ArchiveInfo = await fsx.readJson(infoFile(archiveFolder))
  if (info.totalFileSize !== undefined) return info
  info.totalFileSize = await getFolderSize.loose(archiveFolder)
  await fsx.writeJson(infoFile(archiveFolder), info, { spaces: 2 })
  return info
}

// ---------- Listing functions ----------

// Scans SNAPSHOT_ARCHIVE_FOLDER and returns a uid → ArchiveInfo map.
// Backfills totalFileSize on disk for any legacy archive missing it.
export const listArchives = async (): Promise<Record<string, ArchiveInfo>> => {
  // Ensure the folder exists — migrations and other early-startup callers
  // can run before createDefaultDataFolders has set it up.
  await fsx.ensureDir(SNAPSHOT_ARCHIVE_FOLDER)
  const store: Record<string, ArchiveInfo> = {}
  const dirents = await fs.readdir(SNAPSHOT_ARCHIVE_FOLDER, {
    encoding: 'utf-8',
    withFileTypes: true,
  })
  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    const archiveFolder = path.join(SNAPSHOT_ARCHIVE_FOLDER, dirent.name)
    if (!(await fsx.pathExists(infoFile(archiveFolder)))) continue
    const info = await ensureArchiveSize(archiveFolder)
    store[info.uid] = info
  }
  return store
}

// Scans SNAPSHOT_FOLDER and returns one entry per snapshot. Lazy-backfills
// snapshotSize/archiveSize on disk for any snapshot missing them. The
// archives map is loaded internally if not provided, but callers that
// already have it (e.g. the list route, which also does orphan detection)
// can pass it in to avoid a duplicate scan.
export const listSnapshots = async (
  archives?: Record<string, ArchiveInfo>
): Promise<SnapshotListEntry[]> => {
  const archiveMap = archives ?? (await listArchives())
  const dirents = await fs.readdir(SNAPSHOT_FOLDER, { encoding: 'utf-8', withFileTypes: true })
  const snapshots: SnapshotListEntry[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    const snapshotFolder = path.join(SNAPSHOT_FOLDER, dirent.name)
    if (
      !(await fsx.pathExists(infoFile(snapshotFolder))) ||
      !(await fsx.pathExists(path.join(snapshotFolder, 'database.dump')))
    )
      continue

    const info = await ensureSnapshotSizes(snapshotFolder, archiveMap)

    const archiveJsonPath = path.join(snapshotFolder, 'archive.json')
    const referenced: ArchiveInfo[] = (await fsx.pathExists(archiveJsonPath))
      ? ((await fsx.readJson(archiveJsonPath))?.history ?? [])
      : []

    const missingArchives = referenced
      .filter(({ uid }) => !archiveMap[uid])
      .map(({ archiveFolder }) => archiveFolder)

    const isLegacy = await fsx.pathExists(
      path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME, 'archive.json')
    )

    snapshots.push({
      name: dirent.name.replace(timestampStringExpression, ''),
      filename: dirent.name,
      timestamp: info.timestamp,
      version: info.version,
      size: info.snapshotSize ?? 0,
      archiveSize: info.archiveSize ?? 0,
      missingArchives,
      isLegacy,
      archiveUids: referenced.map(({ uid }) => uid),
    })
  }

  snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return snapshots
}

// ---------- Mutating operations ----------

// Copies the given archive folders from sourceBasePath into the central
// archive store, skipping any whose destination already exists.
export const copyArchivesIfMissing = async (
  archiveFolderNames: string[],
  sourceBasePath: string
): Promise<void> => {
  for (const folder of archiveFolderNames) {
    const dest = path.join(SNAPSHOT_ARCHIVE_FOLDER, folder)
    if (await fsx.pathExists(dest)) continue
    await fsx.copy(path.join(sourceBasePath, folder), dest)
  }
}

// Returns archive folder names that exist on disk but aren't referenced by
// any snapshot.
export const findOrphanArchives = (
  archives: Record<string, ArchiveInfo>,
  snapshots: SnapshotListEntry[]
): string[] => {
  const inUse = new Set(snapshots.flatMap((s) => s.archiveUids))
  return Object.values(archives)
    .filter((a) => !inUse.has(a.uid))
    .map(({ archiveFolder }) => archiveFolder)
}

// Deletes orphan archive folders. Returns the list of folder names removed.
export const purgeOrphanArchives = async (): Promise<string[]> => {
  const archives = await listArchives()
  const snapshots = await listSnapshots(archives)
  const orphans = findOrphanArchives(archives, snapshots)
  for (const folder of orphans) {
    await fsx.remove(path.join(SNAPSHOT_ARCHIVE_FOLDER, folder))
  }
  return orphans
}
