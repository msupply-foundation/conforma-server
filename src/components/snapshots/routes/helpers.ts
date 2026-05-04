import fsx from 'fs-extra'
import { ARCHIVE_SUBFOLDER_NAME, INFO_FILE_NAME, SNAPSHOT_FOLDER } from '../../../constants'
import path from 'path'
import { ArchiveInfo } from '../../files/archive'
import type { ArchiveStore } from '../ArchiveStore'

export const timestampStringExpression = /_\d\d\d\d-\d\d-\d\d_\d\d-\d\d-\d\d$/

export const convertSnapshotToNewStructure = async (
  snapshotFolder: string,
  archiveStore: ArchiveStore
) => {
  const snapshotFolderName = path.basename(snapshotFolder)

  if (snapshotFolderName.startsWith('ARCHIVE_')) {
    // Archive-only snapshot, just move the contents to the new location
    const archives = await getDirectoryList(snapshotFolder)

    await archiveStore.copyTo(
      archives
        .filter((item) => item !== 'archive.json' && item !== 'info.json')
        .map((archiveFolder) => ({ archiveFolder }) as ArchiveInfo),
      path.join(snapshotFolder)
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

  // Old-format snapshot with no archives — nothing more to do
  if (!(await fsx.pathExists(oldArchiveFolder))) {
    await fsx.remove(path.join(SNAPSHOT_FOLDER, `${snapshotFolderName}.zip`))
    return
  }

  const archives = await getDirectoryList(oldArchiveFolder)

  await archiveStore.copyTo(
    archives
      .filter((item) => item !== 'archive.json')
      .map((archiveFolder) => ({ archiveFolder }) as ArchiveInfo),
    oldArchiveFolder
  )

  const oldArchiveJson = path.join(oldArchiveFolder, 'archive.json')
  if (await fsx.pathExists(oldArchiveJson)) {
    await fsx.move(oldArchiveJson, path.join(snapshotFolder, 'archive.json'))
  }

  await fsx.remove(oldArchiveFolder)
  await fsx.remove(path.join(SNAPSHOT_FOLDER, `${snapshotFolderName}.zip`))
}

const getDirectoryList = async (directory: string): Promise<string[]> => {
  const dirents = await fsx.readdir(directory, { encoding: 'utf-8', withFileTypes: true })
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)
}
