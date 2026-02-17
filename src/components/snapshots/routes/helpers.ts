import fs from 'fs/promises'
import fsSync from 'fs'
import fsx from 'fs-extra'
import getFolderSize from 'get-folder-size'
import { ARCHIVE_SUBFOLDER_NAME, INFO_FILE_NAME, SNAPSHOT_FOLDER } from '../../../constants'
import path from 'path'
import { SnapshotInfo } from '../../exportAndImport/types'
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
      path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME)
    )

    return true // indicates this was an archive-only snapshot, so calling function shouldn't continue
  }

  const archives = await getDirectoryList(
    path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME)
  )

  await archiveStore.copyTo(
    archives
      .filter((item) => item !== 'archive.json')
      .map((archiveFolder) => ({ archiveFolder }) as ArchiveInfo),
    path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME)
  )

  await fsx.move(
    path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME, 'archive.json'),
    path.join(snapshotFolder, 'archive.json')
  )

  await fsx.remove(path.join(snapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME))
  await fsx.remove(path.join(SNAPSHOT_FOLDER, `${snapshotFolderName}.zip`))
}

const getDirectoryList = async (directory: string): Promise<string[]> => {
  const dirents = await fsx.readdir(directory, { encoding: 'utf-8', withFileTypes: true })
  return dirents.filter((dirent) => dirent.isDirectory()).map((dirent) => dirent.name)
}
