import fs from 'fs/promises'
import fsSync from 'fs'
import { ExportAndImportOptions, ObjectRecord, SnapshotOperation } from '../exportAndImport/types'
import path from 'path'
import { execSync } from 'child_process'
import rimraf from 'rimraf'
import getRecordsAsObject from '../exportAndImport/exportToJson'
import { promisify } from 'util'
import zipper from 'adm-zip'
import pgDiffConfig from './pgDiffConfig.json'
import {
  DEFAULT_SNAPSHOT_NAME,
  DEFAULT_OPTIONS_NAME,
  SNAPSHOT_FILE_NAME,
  OPTIONS_FILE_NAME,
  PG_DIFF_CONFIG_FILE_NAME,
  PG_SCHEMA_DIFF_FILE_NAME,
  ROOT_FOLDER,
  SNAPSHOT_FOLDER,
  SNAPSHOT_OPTIONS_FOLDER,
  FILES_FOLDER,
  LOCALISATION_FOLDER,
  PREFERENCES_FILE,
  PG_DFF_JS_LOCATION,
} from './constants'
import { getBaseFiles, getDirectoryFromPath } from './useSnapshot'
const asyncRimRaf = promisify(rimraf)

const takeSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  optionsName = DEFAULT_OPTIONS_NAME,
  options: inOptions,
  extraOptions = {},
}) => {
  try {
    console.log(`taking snapshot, name: ${snapshotName}`)

    const options = await getOptions(optionsName, inOptions, extraOptions)
    const snapshotObject = await getRecordsAsObject(options)

    const newSnapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)
    // Remove and create snapshot folder
    await asyncRimRaf(newSnapshotFolder)
    execSync(`mkdir ${newSnapshotFolder}`)

    // Write snapshot and config to folder
    await fs.writeFile(
      path.join(newSnapshotFolder, `${SNAPSHOT_FILE_NAME}.json`),
      JSON.stringify(snapshotObject, null, ' ')
    )

    await fs.writeFile(
      path.join(newSnapshotFolder, `${OPTIONS_FILE_NAME}.json`),
      JSON.stringify(options, null, ' ')
    )

    if (options.shouldReInitialise) await getSchemaDiff(newSnapshotFolder)

    await copyFiles(newSnapshotFolder, snapshotObject.file)

    // Copy localisation
    if (options?.includeLocalisation)
      execSync(`cp -r '${LOCALISATION_FOLDER}/' '${newSnapshotFolder}/localisation'`)

    // Copy prefs
    if (options?.includePrefs) execSync(`cp '${PREFERENCES_FILE}' '${newSnapshotFolder}'`)

    await zipSnapshot(newSnapshotFolder, snapshotName)

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
  const optionsRaw = await fs.readFile(optionsFile, {
    encoding: 'utf-8',
  })

  const parsedOptions = JSON.parse(optionsRaw) as ExportAndImportOptions

  return { ...parsedOptions, ...extraOptions }
}

const zipSnapshot = async (snapshotFolder: string, snapshotName: string) => {
  const zip = new zipper()
  zip.addLocalFolder(snapshotFolder)

  await new Promise((resolve, reject) =>
    zip.writeZip(path.join(SNAPSHOT_FOLDER, `${snapshotName}.zip`), (error) => {
      if (error) return reject(error)
      resolve('done')
    })
  )
}

const getSchemaDiff = async (newSnapshotFolder: string) => {
  console.log('creating schema diff ... ')
  // Creating db to compare to
  execSync('./database/initialise_database.sh tmf_app_manager_temp', { cwd: ROOT_FOLDER })

  // Changing pgDiff configuration output to new snapshot directory
  pgDiffConfig.development.compareOptions.outputDirectory = newSnapshotFolder

  await fs.writeFile(
    path.join(ROOT_FOLDER, `${PG_DIFF_CONFIG_FILE_NAME}.json`),
    JSON.stringify(pgDiffConfig, null, ' ')
  )

  // Running diff command, node_modules folder location changes in production build
  execSync(`node ${PG_DFF_JS_LOCATION} -c development initial-script`, {
    cwd: ROOT_FOLDER,
  })
  // Rename diff file

  const diffFile = fsSync.readdirSync(newSnapshotFolder).find((file) => file.endsWith('.sql'))
  if (!diffFile) return

  fsSync.renameSync(
    path.join(newSnapshotFolder, diffFile),
    path.join(newSnapshotFolder, `${PG_SCHEMA_DIFF_FILE_NAME}.sql`)
  )

  console.log('creating schema diff ... done ')
}

const copyFiles = async (newSnapshotFolder: string, fileRecords: ObjectRecord[] = []) => {
  // copy only files that associated with exported file records and base filed in files directory (thumbnails)
  const filePaths = fileRecords.map((fileRecord) => fileRecord.filePath)
  filePaths.push(...fileRecords.map((fileRecord) => fileRecord.thumbnailPath))
  const baseFilePaths = await getBaseFiles(FILES_FOLDER)

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
