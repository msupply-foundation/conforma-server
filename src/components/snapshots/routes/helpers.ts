import fsx from 'fs-extra'
import { ARCHIVE_SUBFOLDER_NAME, INFO_FILE_NAME, SNAPSHOT_FOLDER } from '../../../constants'
import path from 'path'
import { copyArchivesIfMissing, listArchives, rewriteSnapshotSizes } from '../snapshotStore'

export const timestampStringExpression = /_\d\d\d\d-\d\d-\d\d_\d\d-\d\d-\d\d$/

export const convertSnapshotToNewStructure = async (snapshotFolder: string) => {
  const snapshotFolderName = path.basename(snapshotFolder)

  if (snapshotFolderName.startsWith('ARCHIVE_')) {
    // Archive-only snapshot, just move the contents to the new location
    const archives = await getDirectoryList(snapshotFolder)

    await copyArchivesIfMissing(
      archives.filter((item) => item !== 'archive.json' && item !== 'info.json'),
      snapshotFolder
    )

    return true // indicates this was an archive-only snapshot, so calling function shouldn't continue
  }

  // Remove the `archive` field from the info.json (if present)
  const infoPath = path.join(snapshotFolder, `${INFO_FILE_NAME}.json`)
  if (await fsx.pathExists(infoPath)) {
    const info = await fsx.readJSON(infoPath)
    delete info.archive
    await fsx.writeJSON(infoPath, info, { spaces: 2 })
  }

  const oldArchiveFolder = path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME)

  // Old-format snapshot with no archives — nothing more to do besides
  // backfilling the size fields, since the snapshot's contents are now final.
  if (!(await fsx.pathExists(oldArchiveFolder))) {
    await fsx.remove(path.join(SNAPSHOT_FOLDER, `${snapshotFolderName}.zip`))
    await rewriteSnapshotSizes(snapshotFolder, await listArchives())
    return
  }

  const archives = await getDirectoryList(oldArchiveFolder)

  await copyArchivesIfMissing(
    archives.filter((item) => item !== 'archive.json'),
    oldArchiveFolder
  )

  const oldArchiveJson = path.join(oldArchiveFolder, 'archive.json')
  if (await fsx.pathExists(oldArchiveJson)) {
    await fsx.move(oldArchiveJson, path.join(snapshotFolder, 'archive.json'))
  }

  await fsx.remove(oldArchiveFolder)
  await fsx.remove(path.join(SNAPSHOT_FOLDER, `${snapshotFolderName}.zip`))

  // The in-place mutation above changed the snapshot folder size and may
  // have populated archive.json — recompute both size fields.
  await rewriteSnapshotSizes(snapshotFolder, await listArchives())
}

const getDirectoryList = async (directory: string): Promise<string[]> => {
  const dirents = await fsx.readdir(directory, { encoding: 'utf-8', withFileTypes: true })
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)
}
