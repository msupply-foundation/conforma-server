import fs from 'fs/promises'
import fsx from 'fs-extra'
import { INFO_FILE_NAME, SNAPSHOT_ARCHIVE_FOLDER } from '../../constants'
import path from 'path'
import { ArchiveInfo } from '../files/archive'

export class ArchiveStore {
  private store: Record<string, ArchiveInfo> = {}

  private constructor(store: Record<string, ArchiveInfo>) {
    this.store = store
  }

  public static async create(): Promise<ArchiveStore> {
    const store = await getArchiveStore()
    return new ArchiveStore(store)
  }

  public getMissing = (snapshotArchives: ArchiveInfo[]) => {
    return snapshotArchives
      .filter(({ uid }) => !this.store[uid])
      .map(({ archiveFolder }) => archiveFolder)
  }
}

export const getArchiveStore = async () => {
  const store: Record<string, ArchiveInfo> = {}
  const dirents = await fs.readdir(SNAPSHOT_ARCHIVE_FOLDER, {
    encoding: 'utf-8',
    withFileTypes: true,
  })
  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (
      !(await fsx.pathExists(
        path.join(SNAPSHOT_ARCHIVE_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)
      ))
    )
      continue

    const info: ArchiveInfo = await fsx.readJson(
      path.join(SNAPSHOT_ARCHIVE_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)
    )
    store[info.uid] = info
  }
  return store
}
