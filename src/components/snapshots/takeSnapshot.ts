import fs from 'fs'
import fsx from 'fs-extra'
import archiver from 'archiver'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { SnapshotInfo, SnapshotOperation } from '../exportAndImport/types'
import {
  DEFAULT_SNAPSHOT_NAME,
  INFO_FILE_NAME,
  SNAPSHOT_FOLDER,
  FILES_FOLDER,
  LOCALISATION_FOLDER,
  PREFERENCES_FILE,
  GENERIC_THUMBNAILS_FOLDER,
  SNAPSHOT_ARCHIVE_FOLDER,
} from '../../constants'
import DBConnect from '../../../src/components/database/databaseConnect'
import config from '../../config'
import { DateTime } from 'luxon'
import { createDefaultDataFolders } from '../files/createDefaultFolders'
import { errorMessage } from '../utilityFunctions'
import { cleanupDataTables } from '../../lookup-table/utils/cleanupDataTables'
import { buildArchiveManifest, listArchives, measureSnapshotSizes } from './snapshotStore'
import { loadArchiveData } from '../files/helpers'

const execFileAsync = promisify(execFile)

const takeSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  snapshotType = 'normal',
}) => {
  const startTime = Date.now()

  // Ensure relevant folders exist
  await createDefaultDataFolders()

  await cleanupDataTables()

  const TEMP_SNAPSHOT_FOLDER_NAME = `tempSnapshot_${Math.random().toString(36).substring(2, 8)}`

  try {
    console.log(`Taking snapshot: ${snapshotName}`)

    const tempFolder = path.join(SNAPSHOT_FOLDER, TEMP_SNAPSHOT_FOLDER_NAME)

    await fsx.emptyDir(tempFolder)

    // Write snapshot/database to folder
    console.log('Dumping database...')
    const databaseStartTime = Date.now()
    await execFileAsync(
      'pg_dump',
      ['-U', 'postgres', 'tmf_app_manager', '--format=custom', '-f', `${tempFolder}/database.dump`],
      { maxBuffer: 1024 * 1024 * 100 }
    )
    // This plain-text .sql script is NOT used for re-import, but could be
    // useful for debugging when dealing with troublesome snapshots
    // execSync(
    //   `pg_dump -U postgres tmf_app_manager --format=plain --inserts --clean --if-exists -f ${tempFolder}/database.sql`
    // )
    console.log(`Dumping database...done in ${getTimeString(databaseStartTime)}`)

    // Copy main files (not archives)
    await copyFiles(tempFolder)

    // Write the archive manifest. Archives themselves live in the shared
    // archive store and are not copied; the manifest records which of them
    // this database depends on. It is derived from the file table, not from
    // the store's own archive.json, which tracks whichever snapshot was
    // loaded last rather than the database being dumped here.
    const archives = await listArchives()
    const manifest = buildArchiveManifest(
      await DBConnect.getReferencedArchives(),
      archives,
      await loadArchiveData(SNAPSHOT_ARCHIVE_FOLDER)
    )
    if (manifest) {
      await fsx.writeJSON(path.join(tempFolder, 'archive.json'), manifest, { spaces: 2 })
      console.log(`Archives referenced by this database: ${manifest.history.length}`)
    } else console.log('No archives referenced by this database')

    // Copy localisation
    await fsx.copy(LOCALISATION_FOLDER, path.join(tempFolder, 'localisation'))

    // Copy prefs
    await fsx.copy(PREFERENCES_FILE, path.join(tempFolder, path.basename(PREFERENCES_FILE)))

    // Save snapshot info (version, timestamp, sizes). Measure before writing
    // info.json so the size reflects the snapshot's data content; the
    // ~hundred-byte info.json itself isn't counted, which is rounding noise
    // against multi-MB database dumps.
    const { snapshotSize, archiveSize } = await measureSnapshotSizes(tempFolder, archives)
    const info = getSnapshotInfo({ snapshotSize, archiveSize })
    await fs.promises.writeFile(
      path.join(tempFolder, `${INFO_FILE_NAME}.json`),
      JSON.stringify(info, null, ' ')
    )

    // Snapshot folder to include timestamp
    const timestampString = DateTime.fromISO(info.timestamp).toFormat('yyyy-LL-dd_HH-mm-ss')
    const newFolderName = `${snapshotName}_${timestampString}`

    const fullFolderPath = path.join(SNAPSHOT_FOLDER, newFolderName)

    const isBackup = snapshotType === 'backup'

    await fs.promises.rename(tempFolder, fullFolderPath)

    await fsx.remove(tempFolder)

    // Store snapshot name in database (for full exports only, but not backups)
    if (!isBackup) {
      await DBConnect.setSystemInfo('snapshot', newFolderName)
    }

    console.log('Taking snapshot...complete!')
    console.log('Total time:', getTimeString(startTime))

    return { success: true, message: `Created snapshot: ${snapshotName}`, snapshot: newFolderName }
  } catch (e) {
    return { success: false, message: 'error while taking snapshot', error: errorMessage(e) }
  }
}

export const zipSnapshot = async (
  snapshotFolder: string,
  snapshotName: string,
  destination = SNAPSHOT_FOLDER
) => {
  console.log('Zipping snapshot...')
  const zipStartTime = Date.now()
  const output = await fs.createWriteStream(path.join(destination, `${snapshotName}.zip`))
  const archive = archiver('zip', { zlib: { level: 9 } })

  await archive.pipe(output)
  await archive.directory(snapshotFolder, false)
  await archive.finalize()
  console.log(`Zipping snapshot...done in ${getTimeString(zipStartTime)}`)
}

export const getTimeString = (startTime: number) => {
  const timeInMs = Date.now() - startTime
  return `${Math.round(timeInMs / 100) / 10} seconds`
}

const getSnapshotInfo = (sizes: { snapshotSize: number; archiveSize: number }) => {
  const snapshotInfo: SnapshotInfo = {
    timestamp: DateTime.now().toISO(),
    version: config.version,
    snapshotSize: sizes.snapshotSize,
    archiveSize: sizes.archiveSize,
  }

  return snapshotInfo
}

const copyFiles = async (newSnapshotFolder: string) => {
  console.log('Exporting files...')
  const fileCopyStartTime = Date.now()

  await fsx.copy(FILES_FOLDER, path.join(newSnapshotFolder, 'files'), {
    filter: (src) => {
      if (src === FILES_FOLDER) return true
      if (src === GENERIC_THUMBNAILS_FOLDER) return false
      return true
    },
  })

  console.log(`Exporting files...done in ${getTimeString(fileCopyStartTime)}`)
}

export default takeSnapshot
