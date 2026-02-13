import fs from 'fs'
import fsx from 'fs-extra'
import archiver from 'archiver'
import path from 'path'
import { execSync } from 'child_process'
import { SnapshotInfo, SnapshotOperation } from '../exportAndImport/types'
import { ArchiveInfo } from '../files/archive'
import {
  DEFAULT_SNAPSHOT_NAME,
  INFO_FILE_NAME,
  SNAPSHOT_FOLDER,
  FILES_FOLDER,
  LOCALISATION_FOLDER,
  PREFERENCES_FILE,
  ARCHIVE_SUBFOLDER_NAME,
  GENERIC_THUMBNAILS_FOLDER,
  SNAPSHOT_ARCHIVES_FOLDER_NAME,
  ARCHIVE_FOLDER,
} from '../../constants'
import DBConnect from '../../../src/components/database/databaseConnect'
import config from '../../config'
import { DateTime } from 'luxon'
import { createDefaultDataFolders } from '../files/createDefaultFolders'
import { getCurrentArchives } from '../files/helpers'
import { errorMessage } from '../utilityFunctions'
import { cleanupDataTables } from '../../lookup-table/utils/cleanupDataTables'
import { ArchiveStore } from './ArchiveStore'

const TEMP_SNAPSHOT_FOLDER_NAME = '__tempSnapshot'
const TEMP_ARCHIVE_FOLDER_NAME = '__tempArchive'

const takeSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  snapshotType = 'normal',
}) => {
  const startTime = Date.now()

  // Ensure relevant folders exist
  createDefaultDataFolders()

  await cleanupDataTables()

  try {
    console.log(`Taking snapshot: ${snapshotName}`)

    const tempFolder = path.join(SNAPSHOT_FOLDER, TEMP_SNAPSHOT_FOLDER_NAME)

    await fsx.emptyDir(tempFolder)

    // Write snapshot/database to folder
    console.log('Dumping database...')
    const databaseStartTime = Date.now()
    execSync(`pg_dump -U postgres tmf_app_manager --format=custom -f ${tempFolder}/database.dump`)
    // This plain-text .sql script is NOT used for re-import, but could be
    // useful for debugging when dealing with troublesome snapshots
    // execSync(
    //   `pg_dump -U postgres tmf_app_manager --format=plain --inserts --clean --if-exists -f ${tempFolder}/database.sql`
    // )
    console.log(`Dumping database...done in ${getTimeString(databaseStartTime)}`)

    // Copy main files (not archives)
    await copyFiles(tempFolder)

    const archiveStore = await ArchiveStore.create()

    const currentArchives = await getCurrentArchives()

    await archiveStore.copyTo(currentArchives)

    // Copy archive.json file to snapshot
    try {
      await fsx.copy(
        path.join(ARCHIVE_FOLDER, 'archive.json'),
        path.join(tempFolder, 'archive.json')
      )
    } catch {
      console.log('No archives in current system...')
    }

    // Copy localisation
    execSync(`cp -r '${LOCALISATION_FOLDER}/' '${tempFolder}/localisation'`)

    // Copy prefs
    execSync(`cp '${PREFERENCES_FILE}' '${tempFolder}'`)

    // Save snapshot info (version, timestamp, etc)
    const info = getSnapshotInfo()
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

const getSnapshotInfo = () => {
  const snapshotInfo: SnapshotInfo = {
    timestamp: DateTime.now().toISO(),
    version: config.version,
  }

  return snapshotInfo
}

const copyFiles = async (newSnapshotFolder: string) => {
  console.log('Exporting files...')
  const fileCopyStartTime = Date.now()

  const archiveRegex = new RegExp(`.+${config.filesFolder}\/${ARCHIVE_SUBFOLDER_NAME}.*`)

  // Copy files but not archive
  await fsx.copy(FILES_FOLDER, path.join(newSnapshotFolder, 'files'), {
    filter: (src) => {
      if (src === FILES_FOLDER) return true
      if (src === GENERIC_THUMBNAILS_FOLDER) return false
      return !archiveRegex.test(src)
    },
  })

  console.log(`Exporting files...done in ${getTimeString(fileCopyStartTime)}`)
}

// const copyArchiveFiles = async (
//   newSnapshotFolder: string,
//   archiveOption: ArchiveOption = 'full'
// ): Promise<ArchiveInfo> => {
//   console.log('Exporting archive data & files...')
//   const archiveCopyStartTime = Date.now()

//   // Figure out which archive folders we want
//   let archiveFolders: string[]
//   if (archiveOption === 'none') archiveFolders = []
//   else if (archiveOption === 'full') archiveFolders = await getArchiveFolders()
//   else archiveFolders = await getArchiveFolders(archiveOption)

//   let archiveFrom = Infinity
//   let archiveTo = 0

//   // Copy the archive folders
//   for (const folder of archiveFolders) {
//     console.log('Copying archive folder:', folder)
//     await fsx.copy(
//       path.join(ARCHIVE_FOLDER, folder),
//       path.join(newSnapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME, folder)
//     )
//     const info = await fsx.readJson(path.join(ARCHIVE_FOLDER, folder, 'info.json'))
//     if (info.timestamp < archiveFrom) archiveFrom = info.timestamp
//     if (info.timestamp > archiveTo) archiveTo = info.timestamp
//   }

//   console.log(`Exporting archive data & files...done in ${getTimeString(archiveCopyStartTime)}`)

//   // And copy the archive meta-data
//   try {
//     await fsx.copy(
//       path.join(ARCHIVE_FOLDER, 'archive.json'),
//       path.join(newSnapshotFolder, 'files', ARCHIVE_SUBFOLDER_NAME, 'archive.json')
//     )
//   } catch {
//     // No archive.json yet
//     return null
//   }

//   if (archiveOption === 'none') return { type: 'none' }
//   if (archiveOption === 'full')
//     return {
//       type: 'full',
//       from: DateTime.fromMillis(archiveFrom).toISO(),
//       to: DateTime.fromMillis(archiveTo).toISO(),
//     }
//   return {
//     type: 'partial',
//     from: DateTime.fromMillis(archiveFrom).toISO(),
//     to: DateTime.fromMillis(archiveTo).toISO(),
//   }
// }

export default takeSnapshot
