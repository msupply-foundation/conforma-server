import fs from 'fs/promises'
import fsSync from 'fs'
import { ExportAndImportOptions, SnapshotOperation } from '../exportAndImport/types'
import config from '../../config.json'
import path from 'path'
import { getAppEntryPointDir } from '../utilityFunctions'
import { execSync } from 'child_process'
import rimraf from 'rimraf'
import getRecordsAsObject from '../exportAndImport/exportToJson'
import { promisify } from 'util'
import zipper from 'adm-zip'
import pgDiffConfig from './pgDiffConfig.json'
import {
  SNAPSHOT_SUBFOLDER,
  OPTIONS_SUBFOLDER,
  DEFAULT_SNAPSHOT_NAME,
  DEFAULT_OPTIONS_NAME,
  SNAPSHOT_FILE_NAME,
  OPTIONS_FILE_NAME,
  PG_DIFF_CONFIG_FILE_NAME,
  PG_SCHEMA_DIFF_FILE_NAME,
} from './constants'
const asyncRimRaf = promisify(rimraf)

const rootFolder = path.join(getAppEntryPointDir(), '../')
const snapshotsFolder = path.join(getAppEntryPointDir(), config.databaseFolder, SNAPSHOT_SUBFOLDER)
const optionsFolder = path.join(getAppEntryPointDir(), config.databaseFolder, OPTIONS_SUBFOLDER)
const filesFolder = path.join(getAppEntryPointDir(), config.filesFolder)

const takeSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  optionsName = DEFAULT_OPTIONS_NAME,
  options: inOptions,
}) => {
  try {
    console.log(`taking snapshot, name: ${snapshotName}`)

    const options = await getOptions(optionsName, inOptions)
    const snapshotObject = await getRecordsAsObject(options)

    const newSnapshotFolder = path.join(snapshotsFolder, snapshotName)
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

    await getSchemaDiff(newSnapshotFolder)

    copyFiles(newSnapshotFolder, options)

    await zipSnapshot(newSnapshotFolder, snapshotName)

    return { success: true, message: `created snapshot ${snapshotName}` }
  } catch (e) {
    return { success: false, message: 'error while taking snapshot', error: e.toString() }
  }
}

const getOptions = async (optionsName?: string, options?: ExportAndImportOptions) => {
  if (options) {
    console.log('use options passed as a parameter')
    return options
  }

  const optionsFile = path.join(optionsFolder, `${optionsName}.json`)

  console.log(`using options from: ${optionsFile}`)
  const optionsRaw = await fs.readFile(optionsFile, {
    encoding: 'utf-8',
  })

  return JSON.parse(optionsRaw) as ExportAndImportOptions
}

const zipSnapshot = async (snapshotFolder: string, snapshotName: string) => {
  const zip = new zipper()
  zip.addLocalFolder(snapshotFolder)

  await new Promise((resolve, reject) =>
    zip.writeZip(path.join(snapshotsFolder, `${snapshotName}.zip`), (error) => {
      if (error) return reject(error)
      resolve('done')
    })
  )
}

const getSchemaDiff = async (newSnapshotFolder: string) => {
  console.log('creating schema diff ... ')
  // Creating db to compare to
  execSync('./database/initialise_database.sh tmf_app_manager_temp', { cwd: rootFolder })

  // Changing pgDiff configuration output to new snapshot directory
  pgDiffConfig.development.compareOptions.outputDirectory = newSnapshotFolder

  await fs.writeFile(
    path.join(rootFolder, `${PG_DIFF_CONFIG_FILE_NAME}.json`),
    JSON.stringify(pgDiffConfig, null, ' ')
  )

  // Running diff command
  execSync('node node_modules/pg-diff-cli/main.js -c development initial-script', {
    cwd: rootFolder,
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

const copyFiles = (
  newSnapshotFolder: string,
  { includeTables, excludeTables }: ExportAndImportOptions
) => {
  if (
    (includeTables.includes('file') || includeTables.length === 0) &&
    !excludeTables.includes('file')
  ) {
    console.log('copying files ...')
    execSync(`cp -R ${filesFolder} ${newSnapshotFolder}`)
    console.log('copying files ... done')
  }
}

export default takeSnapshot
