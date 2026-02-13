import fs from 'fs/promises'
import fsx from 'fs-extra'
import { INFO_FILE_NAME, SNAPSHOT_ARCHIVE_FOLDER } from '../../constants'
import path from 'path'
import { ArchiveInfo } from '../files/archive'

type Store = Record<string, ArchiveInfo & { inUse?: boolean }>
export class ArchiveStore {
  private store: Store = {}

  private constructor(store: Store) {
    this.store = store
  }

  public static async create(): Promise<ArchiveStore> {
    const store = await getArchiveStore()
    return new ArchiveStore(store)
  }

  public getArchiveList() {
    return Object.values(this.store).map(({ archiveFolder }) => archiveFolder)
  }

  // Marks the provided archive UIDs as in use, which means they are used by at
  // least one snapshot. This is used to determine which archives are not in use
  // and can be safely deleted
  public markInUse(archiveUids: string[]) {
    for (const uid of archiveUids) {
      if (this.store[uid]) this.store[uid].inUse = true
    }
  }

  // Returns a list of missing archive folders based on the provided list of
  // snapshot archives
  public getMissing = (snapshotArchives: ArchiveInfo[]) => {
    return snapshotArchives
      .filter(({ uid }) => !this.store[uid])
      .map(({ archiveFolder }) => archiveFolder)
  }

  // Returns a list of archive folders that are not in use by any snapshots and
  // can be safely deleted -- should only be invoked after all snapshots have
  // been processed and marked
  public getOrphans = async () => {
    const orphans = Object.values(this.store).filter((archive) => !archive.inUse)
    return orphans.map(({ archiveFolder }) => archiveFolder)
  }
}

const getArchiveStore = async () => {
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
