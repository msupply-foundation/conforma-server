import fs from 'fs/promises'
import fsx from 'fs-extra'
import {
  ARCHIVE_FOLDER,
  ARCHIVE_SUBFOLDER_NAME,
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVE_FOLDER,
  SNAPSHOT_FOLDER,
} from '../../constants'
import path from 'path'
import { ArchiveInfo } from '../files/archive'
import { SnapshotInfo } from '../exportAndImport/types'
import getFolderSize from 'get-folder-size'
import { timestampStringExpression } from './routes/helpers'

type Store = Record<string, ArchiveInfo & { inUse?: boolean }>
export class ArchiveStore {
  private store: Store = {}
  private active: ArchiveInfo[] = []

  private constructor(store: Store, active: ArchiveInfo[]) {
    this.store = store
    this.active = active
  }

  public static async create(): Promise<ArchiveStore> {
    const store = await getArchiveStore()
    const active = await getCurrentArchives(this.markInUse, getMissing)
    return new ArchiveStore(store, active)
  }

  public getArchiveList() {
    return Object.values(this.store).map(({ archiveFolder }) => archiveFolder)
  }

  // Copies the provided archive folders from the source location (defaults to
  // current archive folder) to the snapshot archive folder, and adds them to
  // the store if they are not already present.
  public copyTo = async (archives: ArchiveInfo[], basePath: string = ARCHIVE_FOLDER) => {
    for (const { archiveFolder } of archives) {
      const info = await fsx.readJson(path.join(basePath, archiveFolder, `${INFO_FILE_NAME}.json`))
      const { uid } = info
      if (!this.store[uid]) {
        this.store[uid] = info
        await fsx.copy(
          path.join(basePath, archiveFolder),
          path.join(SNAPSHOT_ARCHIVE_FOLDER, archiveFolder)
        )
      }
    }
  }

  // Marks the provided archive UIDs as in use, which means they are used by at
  // least one snapshot. This is used to determine which archives are not in use
  // and can be safely deleted

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

  public purgeOrphans = async () => {
    const orphans = await this.getOrphans()
    console.log('orphans', orphans)
    for (const folder of orphans) {
      // await fsx.remove(path.join(ARCHIVE_FOLDER, folder))
      // await fsx.remove(path.join(SNAPSHOT_ARCHIVE_FOLDER, folder))
      // console.log('Purged orphan archive:', folder)
    }
    return orphans
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

const getCurrentArchives = async (
  markInUse: (archiveUids: string[]) => void,
  getMissing: (snapshotArchives: ArchiveInfo[]) => string[]
): Promise<ArchiveInfo[]> => {
  const dirents = await fs.readdir(SNAPSHOT_FOLDER, { encoding: 'utf-8', withFileTypes: true })

  const snapshots: (SnapshotInfo & {
    name: string
    size: number
    timestamp: string
    missingArchives: string[]
    archiveSize: number
    archiveSizeIncomplete: boolean
  })[] = []

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) continue
    if (!(await fsx.exists(path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`))))
      continue
    if (
      !(await fsx.pathExists(path.join(SNAPSHOT_FOLDER, dirent.name, `database.dump`))) ||
      !(await fsx.pathExists(path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)))
    )
      continue

    const info = await fsx.readJson(
      path.join(SNAPSHOT_FOLDER, dirent.name, `${INFO_FILE_NAME}.json`)
    )

    const size = await getFolderSize.loose(path.join(SNAPSHOT_FOLDER, dirent.name))
    const timestamp: string = info.timestamp

    const snapshotArchiveFolder = path.join(
      SNAPSHOT_FOLDER,
      dirent.name,
      'files',
      ARCHIVE_SUBFOLDER_NAME,
      'archive.json'
    )
    const archives: ArchiveInfo[] = (await fsx.pathExists(snapshotArchiveFolder))
      ? Object.values((await fsx.readJson(snapshotArchiveFolder))?.archives)
      : []

    archiveStore.markInUse(archives.map(({ uid }) => uid))

    const archiveFileSizes = archives?.map(({ totalFileSize }) => totalFileSize)

    // Older snapshots don't have file size data stored against them
    const archiveSizeIncomplete = archiveFileSizes.some((fileSize) => !fileSize)

    const archiveSize = archives.reduce((sum, { totalFileSize }) => sum + (totalFileSize ?? 0), 0)

    const missingArchives = archiveStore.getMissing(archives)

    const name = dirent.name.replace(timestampStringExpression, '')

    snapshots.push({
      name,
      filename: dirent.name,
      size,
      ...info,
      timestamp,
      missingArchives,
      archiveSize,
      archiveSizeIncomplete,
    })
  }

  snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return snapshots
}
