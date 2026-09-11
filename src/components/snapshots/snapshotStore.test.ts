import { buildArchiveManifest, findOrphanArchives, SnapshotListEntry } from './snapshotStore'
import { ArchiveInfo } from '../files/archive'

// buildArchiveManifest decides which archives a snapshot declares it depends
// on. The store may hold archives from many systems; only the ones the
// database's file table points into belong in the manifest.

const info = (archiveFolder: string, uid: string, timestamp: number): ArchiveInfo => ({
  timestamp,
  uid,
  archiveFolder,
  prevArchiveFolder: null,
  prevUid: null,
  numFiles: 1,
  totalFileSize: 100,
})

const referenced = (folder: string, num_files = 1, total_file_size = 100) => ({
  archive_path: `${folder}/files`,
  num_files,
  total_file_size,
})

const A = info('2023-07-27_06-50-04_Avz5EK', 'Avz5EK-full-uid', 1000)
const B = info('2024-04-03_01-10-00_bFO1fq', 'bFO1fq-full-uid', 2000)
const C = info('2025-01-25_01-10-00_S5zveB', 'S5zveB-full-uid', 3000)

const store = { [A.uid]: A, [B.uid]: B, [C.uid]: C }

test('buildArchiveManifest: nothing referenced gives no manifest', () => {
  expect(buildArchiveManifest([], store, { archives: store, history: [A, B, C] })).toBeNull()
})

test('buildArchiveManifest: only referenced archives are included, in timestamp order', () => {
  const manifest = buildArchiveManifest(
    [referenced(C.archiveFolder), referenced(A.archiveFolder)],
    store,
    null
  )
  expect(manifest?.history).toEqual([A, C])
  expect(manifest?.archives).toEqual({ [A.uid]: A, [C.uid]: C })
})

test('buildArchiveManifest: store archives the database never mentions are left out', () => {
  const manifest = buildArchiveManifest([referenced(B.archiveFolder)], store, {
    archives: store,
    history: [A, B, C],
  })
  expect(manifest?.history).toEqual([B])
})

test('buildArchiveManifest: an archive absent from disk falls back to the store manifest', () => {
  const manifest = buildArchiveManifest(
    [referenced(B.archiveFolder)],
    { [A.uid]: A },
    { archives: { [B.uid]: B }, history: [B] }
  )
  expect(manifest?.history).toEqual([B])
})

test('buildArchiveManifest: the on-disk info.json wins over the store manifest entry', () => {
  const stale = { ...B, numFiles: 999 }
  const manifest = buildArchiveManifest([referenced(B.archiveFolder)], store, {
    archives: { [B.uid]: stale },
    history: [stale],
  })
  expect(manifest?.history[0].numFiles).toBe(B.numFiles)
})

test('buildArchiveManifest: an unknown archive is synthesised from the folder name and file table', () => {
  const folder = '2026-06-27_01-10-00_8hP43c'
  const manifest = buildArchiveManifest([referenced(folder, 397, 102_000_000)], {}, null)
  const entry = manifest?.history[0]
  expect(entry).toMatchObject({
    uid: folder,
    archiveFolder: folder,
    numFiles: 397,
    totalFileSize: 102_000_000,
    prevUid: null,
    prevArchiveFolder: null,
  })
  expect(new Date(entry!.timestamp).getFullYear()).toBe(2026)
  expect(manifest?.archives[folder]).toBe(entry)
})

test('buildArchiveManifest: a folder referenced under two paths appears once', () => {
  const manifest = buildArchiveManifest(
    [
      referenced(A.archiveFolder),
      { ...referenced(A.archiveFolder), archive_path: `${A.archiveFolder}/files/` },
    ],
    store,
    null
  )
  expect(manifest?.history).toEqual([A])
})

// findOrphanArchives decides what a purge may delete. An archive is safe as
// long as any snapshot manifest lists it or the live database points into it.

const snapshot = (archiveFolders: string[]): SnapshotListEntry => ({
  name: 'snap',
  filename: 'snap_2026-01-01_00-00-00',
  timestamp: '2026-01-01T00:00:00.000Z',
  version: '2.0.0',
  size: 0,
  archiveSize: 0,
  missingArchives: [],
  isLegacy: false,
  archiveFolders,
})

test('findOrphanArchives: archives listed by no snapshot are orphans', () => {
  expect(findOrphanArchives(store, [snapshot([A.archiveFolder])])).toEqual([
    B.archiveFolder,
    C.archiveFolder,
  ])
})

test('findOrphanArchives: archives the live database references are never orphans', () => {
  expect(findOrphanArchives(store, [snapshot([A.archiveFolder])], [C.archiveFolder])).toEqual([
    B.archiveFolder,
  ])
})

test('findOrphanArchives: with no snapshots at all, the live database alone protects', () => {
  expect(findOrphanArchives(store, [], [A.archiveFolder, B.archiveFolder])).toEqual([
    C.archiveFolder,
  ])
})

test('findOrphanArchives: nothing is an orphan when everything is referenced', () => {
  expect(
    findOrphanArchives(store, [snapshot([A.archiveFolder, B.archiveFolder, C.archiveFolder])])
  ).toEqual([])
})
