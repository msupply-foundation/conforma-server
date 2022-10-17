import fs from 'fs'
// import fsSync from 'fs'
import archiver from 'archiver'
import { ExportAndImportOptions, ObjectRecord, SnapshotOperation } from '../exportAndImport/types'
import path from 'path'
import { execSync } from 'child_process'
import rimraf from 'rimraf'
import getRecordsAsObject from '../exportAndImport/exportToJson'
import { promisify } from 'util'
import pgDiffConfig from './pgDiffConfig.json'
import {
  DEFAULT_SNAPSHOT_NAME,
  DEFAULT_OPTIONS_NAME,
  SNAPSHOT_FILE_NAME,
  OPTIONS_FILE_NAME,
  INFO_FILE_NAME,
  PG_DIFF_CONFIG_FILE_NAME,
  PG_SCHEMA_DIFF_FILE_NAME,
  ROOT_FOLDER,
  SNAPSHOT_FOLDER,
  SNAPSHOT_OPTIONS_FOLDER,
  FILES_FOLDER,
  LOCALISATION_FOLDER,
  SCHEMA_FILE_NAME,
  PREFERENCES_FILE,
  PG_DFF_JS_LOCATION,
  DATABASE_FOLDER,
} from '../../constants'
import { getBaseFiles, getDirectoryFromPath } from './useSnapshot'
import config from '../../config'
import { DateTime } from 'luxon'
const asyncRimRaf = promisify(rimraf)
import { createDefaultDataFolders } from '../files/createDefaultFolders'

const takeSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  optionsName = DEFAULT_OPTIONS_NAME,
  options: inOptions,
  extraOptions = {},
}) => {
  // Ensure relevant folders exist
  createDefaultDataFolders()

  try {
    console.log(`taking snapshot, name: ${snapshotName}`)

    const options = await getOptions(optionsName, inOptions, extraOptions)

    const newSnapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)
    // Remove and create snapshot folder
    await asyncRimRaf(newSnapshotFolder)
    execSync(`mkdir ${newSnapshotFolder}`)

    // Write snapshot/database to folder
    if (options.usePgDump) {
      // The quick way, using pg_dump -- whole database only
      console.log('Dumping database...')
      execSync(`pg_dump tmf_app_manager --format=custom -f ${newSnapshotFolder}/database.dump`)
      console.log('Dumping database...done')

      // Copy ALL files
      console.log('Exporting files...')
      execSync(`cp -a '${FILES_FOLDER}'/. '${newSnapshotFolder}/files'`)
      console.log('Exporting files...done')
    } else {
      // Do it the old way, using JSON database object export
      const snapshotObject = await getRecordsAsObject(options)
      await fs.promises.writeFile(
        path.join(newSnapshotFolder, `${SNAPSHOT_FILE_NAME}.json`),
        JSON.stringify(snapshotObject, null, 2)
      )
      await copyFiles(newSnapshotFolder, snapshotObject.file ?? [], options)
    }

    // Export config
    await fs.promises.writeFile(
      path.join(newSnapshotFolder, `${OPTIONS_FILE_NAME}.json`),
      JSON.stringify(options, null, ' ')
    )

    if (options.shouldReInitialise && !options.usePgDump) {
      await getSchemaDiff(newSnapshotFolder)
      // Copy schema build script
      execSync(
        `cat ${DATABASE_FOLDER}/buildSchema/*.sql >> ${newSnapshotFolder}/${SCHEMA_FILE_NAME}.sql`
      )
    }

    // Copy localisation
    if (options?.includeLocalisation)
      execSync(`cp -r '${LOCALISATION_FOLDER}/' '${newSnapshotFolder}/localisation'`)

    // Copy prefs
    if (options?.includePrefs) execSync(`cp '${PREFERENCES_FILE}' '${newSnapshotFolder}'`)

    // Save snapshot info (version, timestamp, etc)
    await fs.promises.writeFile(
      path.join(newSnapshotFolder, `${INFO_FILE_NAME}.json`),
      JSON.stringify(getSnapshotInfo(), null, ' ')
    )

    if (!options.skipZip) await zipSnapshot(newSnapshotFolder, snapshotName)

    return { success: true, message: `created snapshot ${snapshotName}` }
  } catch (e) {
    return { success: false, message: 'error while taking snapshot', error: e.toString() }
  }
}

const getOptions = async (
  optionsName?: string,
  options?: ExportAndImportOptions,
  extraOptions: Partial<ExportAndImportOptions> = {}
) => {
  if (options) {
    console.log('use options passed as a parameter')
    return { ...options, ...extraOptions }
  }

  const optionsFile = path.join(SNAPSHOT_OPTIONS_FOLDER, `${optionsName}.json`)

  console.log(`using options from: ${optionsFile}`)
  const optionsRaw = await fs.promises.readFile(optionsFile, {
    encoding: 'utf-8',
  })

  const parsedOptions = JSON.parse(optionsRaw) as ExportAndImportOptions

  return { ...parsedOptions, ...extraOptions }
}

const zipSnapshot = async (snapshotFolder: string, snapshotName: string) => {
  const output = fs.createWriteStream(path.join(SNAPSHOT_FOLDER, `${snapshotName}.zip`))
  const archive = archiver('zip')

  archive.pipe(output)
  archive.directory(snapshotFolder, false)
  archive.finalize()
}

const getSnapshotInfo = () => {
  return {
    timestamp: DateTime.now().toISOTime(),
    version: config.version,
  }
}

const getSchemaDiff = async (newSnapshotFolder: string) => {
  console.log('creating schema diff ... ')
  // Creating db to compare to
  execSync('./database/initialise_database.sh tmf_app_manager_temp', { cwd: ROOT_FOLDER })

  // Changing pgDiff configuration output to new snapshot directory
  pgDiffConfig.development.compareOptions.outputDirectory = newSnapshotFolder

  await fs.promises.writeFile(
    path.join(ROOT_FOLDER, `${PG_DIFF_CONFIG_FILE_NAME}.json`),
    JSON.stringify(pgDiffConfig, null, ' ')
  )

  // Running diff command, node_modules folder location changes in production build
  execSync(`node ${PG_DFF_JS_LOCATION} -c development initial-script`, {
    cwd: ROOT_FOLDER,
  })
  // Rename diff file

  const diffFile = fs.readdirSync(newSnapshotFolder).find((file) => file.endsWith('.sql'))
  if (!diffFile) return

  fs.renameSync(
    path.join(newSnapshotFolder, diffFile),
    path.join(newSnapshotFolder, `${PG_SCHEMA_DIFF_FILE_NAME}.sql`)
  )

  console.log('creating schema diff ... done ')
}

const copyFiles = async (
  newSnapshotFolder: string,
  fileRecords: ObjectRecord[],
  options: ExportAndImportOptions
) => {
  // copy only files that associated with exported file records and base filed in files directory (thumbnails)
  const filePaths = fileRecords.map((fileRecord) => fileRecord.filePath)
  filePaths.push(...fileRecords.map((fileRecord) => fileRecord.thumbnailPath))
  const baseFilePaths = options.resetFiles ? await getBaseFiles(FILES_FOLDER) : []

  for (const filePath of [...filePaths, ...baseFilePaths]) {
    try {
      console.log('copying file', filePath)
      const destinationDirectory = `${newSnapshotFolder}/files/${getDirectoryFromPath(filePath)}`
      // -p = no error if exists, create parent
      execSync(`mkdir -p '${destinationDirectory}'`)

      execSync(`cp '${FILES_FOLDER}/${filePath}' '${destinationDirectory}'`)
    } catch (e) {
      console.log('failed to copy file', e)
    }
  }
}

export default takeSnapshot
