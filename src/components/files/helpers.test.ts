import { archiveFolderOf, partitionMissingFiles } from './helpers'

// partitionMissingFiles is the rule behind the file cleanup's handling of
// records whose file is not on disk: files-folder records are stale and go,
// archived records are kept and counted per archive folder.

test('archiveFolderOf: returns the folder segment of an archive path', () => {
  expect(archiveFolderOf('2026-06-27_01-10-00_8hP43c/files')).toBe('2026-06-27_01-10-00_8hP43c')
})

test('partitionMissingFiles: files-folder records are marked stale', () => {
  const result = partitionMissingFiles([
    { id: 1, archivePath: null },
    { id: 2, archivePath: null },
  ])
  expect(result.staleRecordIds).toEqual([1, 2])
  expect(result.missingArchived.size).toBe(0)
})

test('partitionMissingFiles: archived records are never stale, and are counted per folder', () => {
  const result = partitionMissingFiles([
    { id: 1, archivePath: 'folderA/files' },
    { id: 2, archivePath: 'folderA/files' },
    { id: 3, archivePath: 'folderB/files' },
    { id: 4, archivePath: null },
  ])
  expect(result.staleRecordIds).toEqual([4])
  expect([...result.missingArchived.entries()]).toEqual([
    ['folderA', 2],
    ['folderB', 1],
  ])
})

test('partitionMissingFiles: nothing missing gives empty results', () => {
  const result = partitionMissingFiles([])
  expect(result.staleRecordIds).toEqual([])
  expect(result.missingArchived.size).toBe(0)
})
