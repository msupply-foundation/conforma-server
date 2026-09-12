import fs from 'fs/promises'
import fsx from 'fs-extra'
import path from 'path'
import getFolderSize from 'get-folder-size'
import { DateTime } from 'luxon'
import { archiveFolderOf } from '../files/helpers'
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
  archiveFolders: string[]
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

// ---------- Manifest construction ----------

// An archive path the file table points into, as reported by
// DBConnect.getReferencedArchives.
export type ReferencedArchive = {
  archive_path: string
  num_files: number
  total_file_size: number
}

// The archive folders the database points into, one name per folder
export const referencedArchiveFolders = (referenced: ReferencedArchive[]): string[] =>
  referenced.map(({ archive_path }) => archiveFolderOf(archive_path))

// Builds a snapshot's archive.json from the archives its database actually
// references, so the manifest declares exactly the archives needed to
// restore it. Metadata for each folder comes from the archive's own info.json
// in the store when it is there, else from the store's archive.json (which
// can still describe an archive that has left the disk), else is synthesised
// from the folder name and the file table so the dependency is still
// declared. Returns null when the database references no archives.
export const buildArchiveManifest = (
  referenced: ReferencedArchive[],
  storeArchives: Record<string, ArchiveInfo>,
  storeManifest: ArchiveData | null
): ArchiveData | null => {
  if (referenced.length === 0) return null

  // The on-disk info.json is authoritative, so it is applied last
  const known = new Map<string, ArchiveInfo>()
  for (const info of storeManifest?.history ?? []) known.set(info.archiveFolder, info)
  for (const info of Object.values(storeArchives)) known.set(info.archiveFolder, info)

  const entries = new Map<string, ArchiveInfo>()
  for (const { archive_path, num_files, total_file_size } of referenced) {
    const archiveFolder = archiveFolderOf(archive_path)
    if (entries.has(archiveFolder)) continue
    entries.set(
      archiveFolder,
      known.get(archiveFolder) ?? synthesiseArchiveInfo(archiveFolder, num_files, total_file_size)
    )
  }

  const history = [...entries.values()].sort((a, b) => a.timestamp - b.timestamp)
  const archives = Object.fromEntries(history.map((info) => [info.uid, info]))
  return { archives, history }
}

// Archive folders are named "yyyy-LL-dd_HH-mm-ss_<first 6 chars of uid>", so
// the timestamp is recoverable but the full uid is not. The folder name
// stands in for the uid. It only has to be unique within the manifest:
// presence and orphan checks compare folder names, never uids.
const synthesiseArchiveInfo = (
  archiveFolder: string,
  numFiles: number,
  totalFileSize: number
): ArchiveInfo => {
  const parsed = DateTime.fromFormat(archiveFolder.slice(0, 19), 'yyyy-LL-dd_HH-mm-ss')
  return {
    timestamp: parsed.isValid ? parsed.toMillis() : 0,
    uid: archiveFolder,
    archiveFolder,
    prevArchiveFolder: null,
    prevUid: null,
    numFiles,
    totalFileSize,
  }
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
  // Presence is judged by folder name: that is what exists on disk and what
  // the load check compares. Uids can be synthesised (see
  // buildArchiveManifest), so they are not reliable for matching.
  const storeFolders = new Set(Object.values(archiveMap).map((a) => a.archiveFolder))
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

    const referencedFolders = referenced.map(({ archiveFolder }) => archiveFolder)
    const missingArchives = referencedFolders.filter((folder) => !storeFolders.has(folder))

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
      archiveFolders: referencedFolders,
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

// Returns archive folder names that exist on disk but are needed neither by
// any snapshot manifest nor by the live database. The database has to be
// consulted: archives created since the last snapshot was taken are
// referenced nowhere else, and on a server that keeps no snapshots (the
// backup job removes the one it takes) it is the only reference there is.
export const findOrphanArchives = (
  archives: Record<string, ArchiveInfo>,
  snapshots: SnapshotListEntry[],
  liveArchiveFolders: Iterable<string> = []
): string[] => {
  const inUse = new Set([...snapshots.flatMap((s) => s.archiveFolders), ...liveArchiveFolders])
  return Object.values(archives)
    .map(({ archiveFolder }) => archiveFolder)
    .filter((folder) => !inUse.has(folder))
}

// Deletes orphan archive folders. `liveArchiveFolders` are the folders the
// current database references (see DBConnect.getReferencedArchives); those
// are never deleted. Returns the folders removed, and how many archives
// listed by no snapshot were kept because the database needs them.
export const purgeOrphanArchives = async (
  liveArchiveFolders: string[]
): Promise<{ purged: string[]; keptForDatabase: number }> => {
  const archives = await listArchives()
  const snapshots = await listSnapshots(archives)
  const unlistedBySnapshots = findOrphanArchives(archives, snapshots)
  const purged = findOrphanArchives(archives, snapshots, liveArchiveFolders)
  for (const folder of purged) {
    await fsx.remove(path.join(SNAPSHOT_ARCHIVE_FOLDER, folder))
  }
  return { purged, keptForDatabase: unlistedBySnapshots.length - purged.length }
}
