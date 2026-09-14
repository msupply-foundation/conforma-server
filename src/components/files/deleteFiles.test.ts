import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { deleteFile } from './deleteFiles'

// deleteFile removes files from the files folder. Archived files must be left
// alone: the archive store is immutable, and deleting a record for an archived
// file only makes that file unreferenced.

let root: string

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'conforma-deleteFile-'))
  await fs.mkdir(path.join(root, 'sub'))
  await fs.writeFile(path.join(root, 'sub', 'doc.pdf'), 'doc')
  await fs.writeFile(path.join(root, 'sub', 'doc_thumb.png'), 'thumb')
})

afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true })
})

const exists = async (p: string) =>
  fs
    .access(p)
    .then(() => true)
    .catch(() => false)

test('deleteFile: a files-folder record has its file, thumbnail and emptied folder removed', async () => {
  await deleteFile({ filePath: 'sub/doc.pdf', thumbnailPath: 'sub/doc_thumb.png' }, root)
  expect(await exists(path.join(root, 'sub', 'doc.pdf'))).toBe(false)
  expect(await exists(path.join(root, 'sub', 'doc_thumb.png'))).toBe(false)
  expect(await exists(path.join(root, 'sub'))).toBe(false)
})

test('deleteFile: an archived record leaves everything on disk untouched', async () => {
  await deleteFile(
    { filePath: 'sub/doc.pdf', thumbnailPath: 'sub/doc_thumb.png', archivePath: 'x/files' },
    root
  )
  expect(await exists(path.join(root, 'sub', 'doc.pdf'))).toBe(true)
  expect(await exists(path.join(root, 'sub', 'doc_thumb.png'))).toBe(true)
})

test('deleteFile: a missing file is not an error', async () => {
  await expect(deleteFile({ filePath: 'sub/absent.pdf' }, root)).resolves.toBeUndefined()
})
